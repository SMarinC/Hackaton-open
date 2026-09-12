// Pixels stay in the browser. Only temporal observations go to the case service.
export class VideoAnalyzer {
  constructor(video, { onFrame, onError, onStatus }) {
    this.video = video;
    this.onFrame = onFrame;
    this.onError = onError;
    this.onStatus = onStatus;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d", { willReadFrequently: true });
    this.generation = 0;
    this.loopId = 0;
    this.running = false;
    this.busy = false;
    this.lastMediaTime = -1;
    this.lastSampleStarted = -Infinity;
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
                return { ...p, bbox: [x, y, right - x, bottom - y] };
              })
              .filter((p) => p.bbox[2] > 0 && p.bbox[3] > 0),
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
