// Pixels stay in the browser. Only temporal observations go to the case service.
import { edgeActivity, occupancyScore } from "./shelf-occupancy.js";

const APPEARANCE_ROWS = 3;
const APPEARANCE_COLS = 2;

// A coarse per-cell average color of a person's crop, used only as a local
// re-identification heuristic (see ZoneTracker): never sent anywhere, never a
// claim of validated identity. Returns null on anything unreadable, including
// a tainted canvas (a cross-origin frame without CORS clearance throws on
// getImageData), so callers must treat it as always-optional.
function extractAppearance(context, bbox, maxWidth, maxHeight) {
  try {
    const x = Math.max(0, Math.round(bbox[0]));
    const y = Math.max(0, Math.round(bbox[1]));
    const width = Math.min(Math.round(bbox[2]), maxWidth - x);
    const height = Math.min(Math.round(bbox[3]), maxHeight - y);
    if (width < 2 || height < 2) return null;
    const { data } = context.getImageData(x, y, width, height);
    const cells = APPEARANCE_ROWS * APPEARANCE_COLS;
    const sums = new Array(cells * 3).fill(0);
    const counts = new Array(cells).fill(0);
    for (let py = 0; py < height; py++) {
      const row = Math.min(APPEARANCE_ROWS - 1, Math.floor((py / height) * APPEARANCE_ROWS));
      for (let px = 0; px < width; px++) {
        const col = Math.min(APPEARANCE_COLS - 1, Math.floor((px / width) * APPEARANCE_COLS));
        const cell = row * APPEARANCE_COLS + col;
        const offset = (py * width + px) * 4;
        sums[cell * 3] += data[offset];
        sums[cell * 3 + 1] += data[offset + 1];
        sums[cell * 3 + 2] += data[offset + 2];
        counts[cell]++;
      }
    }
    return sums.map((sum, i) => (counts[Math.floor(i / 3)] ? sum / counts[Math.floor(i / 3)] : 0));
  } catch {
    return null;
  }
}

export class VideoAnalyzer {
  constructor(video, { onFrame, onError, onStatus, getZones }) {
    this.video = video;
    this.onFrame = onFrame;
    this.onError = onError;
    this.onStatus = onStatus;
    this.getZones = getZones;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d", { willReadFrequently: true });
    this.generation = 0;
    this.loopId = 0;
    this.running = false;
    this.busy = false;
    this.lastMediaTime = -1;
    this.lastSampleStarted = -Infinity;
    this.lastActivity = new Map();
    this.baselines = new Map();
  }

  // Stores the most recently sampled per-zone edge activity as the "full
  // shelf" reference; every later frame's occupancyScore compares against
  // this until it is captured again or the analyzer resets. Returns how many
  // zones got a baseline, so a caller can warn on zero.
  captureShelfBaseline() {
    this.baselines = new Map(this.lastActivity);
    return this.baselines.size;
  }

  // Bounding-box approximation of each zone polygon (not an exact mask,
  // cheap and good enough for a heuristic), sampled for edge activity and
  // scored against any captured baseline. Never throws: an unreadable canvas
  // or a misconfigured zone is skipped, not fatal to the frame.
  sampleShelfOccupancy(width, height) {
    if (typeof this.getZones !== "function") return [];
    let zones;
    try {
      zones = this.getZones() ?? [];
    } catch {
      return [];
    }
    const readings = [];
    for (const zone of zones) {
      if (!zone || !Array.isArray(zone.polygon) || zone.polygon.length < 3)
        continue;
      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      for (const point of zone.polygon) {
        if (!Array.isArray(point) || point.length !== 2) continue;
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
      }
      const x = Math.max(0, Math.round(minX * width));
      const y = Math.max(0, Math.round(minY * height));
      const w = Math.min(width - x, Math.round((maxX - minX) * width));
      const h = Math.min(height - y, Math.round((maxY - minY) * height));
      if (w < 2 || h < 2) continue;
      let activity;
      try {
        activity = edgeActivity(this.context.getImageData(x, y, w, h));
      } catch {
        continue;
      }
      this.lastActivity.set(zone.id, activity);
      readings.push({
        zoneId: zone.id,
        zoneName: zone.name,
        activity,
        score: occupancyScore(activity, this.baselines.get(zone.id)),
      });
    }
    return readings;
  }

  async load() {
    if (this.model) return;
    this.onStatus("Cargando detector local…");
    const tf = await import("@tensorflow/tfjs-core");
    await import("@tensorflow/tfjs-backend-webgl");
    await import("@tensorflow/tfjs-backend-cpu");
    try {
      await tf.setBackend("webgl");
      await tf.ready();
    } catch {
      await tf.setBackend("cpu");
      await tf.ready();
    }
    const coco = await import("@tensorflow-models/coco-ssd");
    this.model = await coco.load({
      base: "lite_mobilenet_v2",
      ...(import.meta.env.VITE_MODEL_URL
        ? { modelUrl: import.meta.env.VITE_MODEL_URL }
        : {}),
    });
    this.onStatus(`Detector listo · ${tf.getBackend().toUpperCase()}`);
  }

  reset() {
    this.generation++;
    this.lastMediaTime = -1;
    // A shelf baseline is tied to this camera framing and lighting; carrying
    // it across a source change or a manual reset would silently misscore
    // the next scene, so a fresh baseline must be captured again on purpose.
    this.lastActivity = new Map();
    this.baselines = new Map();
  }
  stop() {
    this.running = false;
    this.loopId++;
    this.reset();
    cancelAnimationFrame(this.frameRequest);
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.tick(++this.loopId);
  }

  async tick(loopId = this.loopId) {
    if (!this.running || loopId !== this.loopId) return;
    const video = this.video;
    if (
      !this.busy &&
      this.model &&
      !video.paused &&
      !video.ended &&
      !video.seeking &&
      video.readyState >= 2 &&
      video.currentTime !== this.lastMediaTime &&
      performance.now() - this.lastSampleStarted >= 120
    ) {
      this.busy = true;
      const generation = this.generation;
      const mediaTime = video.currentTime;
      const started = performance.now();
      this.lastSampleStarted = started;
      try {
        // Freeze the frame BEFORE inference, so its timestamp cannot drift during a slow prediction.
        const width = Math.min(video.videoWidth, 960);
        const height = Math.round(
          (video.videoHeight * width) / video.videoWidth,
        );
        if (this.canvas.width !== width || this.canvas.height !== height) {
          this.canvas.width = width;
          this.canvas.height = height;
        }
        this.context.drawImage(video, 0, 0, width, height);
        const predictions = await this.model.detect(this.canvas, 30, 0.45);
        if (generation === this.generation && this.running && !video.seeking) {
          this.lastMediaTime = mediaTime;
          this.onFrame({
            mediaTime,
            inferenceMs: performance.now() - started,
            detections: predictions
              .filter((p) => p.class === "person")
              .map((p) => {
                const appearance = extractAppearance(
                  this.context,
                  p.bbox,
                  width,
                  height,
                );
                const x = Math.max(0, Math.min(1, p.bbox[0] / width));
                const y = Math.max(0, Math.min(1, p.bbox[1] / height));
                const right = Math.max(
                  x,
                  Math.min(1, (p.bbox[0] + p.bbox[2]) / width),
                );
                const bottom = Math.max(
                  y,
                  Math.min(1, (p.bbox[1] + p.bbox[3]) / height),
                );
                return {
                  ...p,
                  bbox: [x, y, right - x, bottom - y],
                  ...(appearance ? { appearance } : {}),
                };
              })
              .filter((p) => p.bbox[2] > 0 && p.bbox[3] > 0),
            shelfOccupancy: this.sampleShelfOccupancy(width, height),
          });
        }
      } catch (error) {
        if (generation === this.generation && this.running) {
          this.stop();
          this.onError(error);
        }
      } finally {
        this.busy = false;
      }
    }
    if (this.running && loopId === this.loopId)
      this.frameRequest = requestAnimationFrame(() => this.tick(loopId));
  }
}
