const EPSILON = 1e-9;
const MAX_TRAIL_POINTS = 40;

const finite = (value) => typeof value === "number" && Number.isFinite(value);
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const center = ([x, y, width, height]) => [x + width / 2, y + height / 2];
const footPoint = ([x, y, width, height]) => [x + width / 2, y + height];

function containsPoint(polygon, point) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[j];
    const [bx, by] = polygon[i];
    const [px, py] = point;
    const cross = (px - ax) * (by - ay) - (py - ay) * (bx - ax);
    // Boundary points belong to the zone; overlapping zones use input order.
    if (
      Math.abs(cross) <= EPSILON &&
      px >= Math.min(ax, bx) - EPSILON &&
      px <= Math.max(ax, bx) + EPSILON &&
      py >= Math.min(ay, by) - EPSILON &&
      py <= Math.max(ay, by) + EPSILON
    ) {
      return true;
    }
    if (ay > py !== by > py && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) {
      inside = !inside;
    }
  }
  return inside;
}

function intersectionOverUnion(a, b) {
  const width = Math.max(
    0,
    Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]),
  );
  const height = Math.max(
    0,
    Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]),
  );
  const intersection = width * height;
  return intersection / (a[2] * a[3] + b[2] * b[3] - intersection);
}

function copyZones(zones) {
  if (!Array.isArray(zones)) throw new TypeError("zones must be an array");
  const ids = new Set();
  return zones.map((zone) => {
    if (
      !zone ||
      typeof zone.id !== "string" ||
      !zone.id.trim() ||
      ids.has(zone.id)
    ) {
      throw new TypeError("Each zone needs a unique, nonempty string id");
    }
    if (typeof zone.name !== "string" || !zone.name.trim()) {
      throw new TypeError("Each zone needs a nonempty name");
    }
    if (
      !Array.isArray(zone.polygon) ||
      zone.polygon.length < 3 ||
      !zone.polygon.every(
        (point) =>
          Array.isArray(point) &&
          point.length === 2 &&
          point.every((value) => finite(value) && value >= 0 && value <= 1),
      )
    ) {
      throw new TypeError(
        "Zone polygons need at least three normalized [x, y] points",
      );
    }
    const area = zone.polygon.reduce((sum, point, i) => {
      const next = zone.polygon[(i + 1) % zone.polygon.length];
      return sum + point[0] * next[1] - next[0] * point[1];
    }, 0);
    if (Math.abs(area) <= EPSILON)
      throw new RangeError("Zone polygons must have positive area");
    ids.add(zone.id);
    return {
      id: zone.id,
      name: zone.name,
      polygon: zone.polygon.map((point) => [...point]),
    };
  });
}

function usableDetection(detection, minScore) {
  if (
    !detection ||
    detection.class !== "person" ||
    !finite(detection.score) ||
    detection.score < minScore ||
    detection.score > 1
  )
    return false;
  const box = detection.bbox;
  return (
    Array.isArray(box) &&
    box.length === 4 &&
    box.every(finite) &&
    box[0] >= 0 &&
    box[1] >= 0 &&
    box[2] > 0 &&
    box[3] > 0 &&
    box[0] + box[2] <= 1 + EPSILON &&
    box[1] + box[3] <= 1 + EPSILON
  );
}

/**
 * Geometric tracking for a sampled demo, not persistent person identification.
 * Greedy one-to-one association can switch IDs in crowds or crossing paths.
 * Dwell uses media time, accumulating only between consecutive observed samples.
 * Short missed detections retain identity/visit state without accruing hidden time.
 * A backwards seek or sample gap greater than maxGap resets the whole run.
 * IDs are run-local: callers must pair them with their own unique run identifier.
 * visit_id changes on each observed zone entry; short gaps retain the same visit.
 */
export class ZoneTracker {
  constructor({
    zones,
    dwellThreshold = 8,
    maxGap = 1.5,
    minScore = 0.45,
  } = {}) {
    this.zones = copyZones(zones);
    if (!finite(dwellThreshold) || dwellThreshold <= 0) {
      throw new RangeError(
        "dwellThreshold must be a positive number of seconds",
      );
    }
    if (!finite(maxGap) || maxGap <= 0)
      throw new RangeError("maxGap must be positive");
    if (!finite(minScore) || minScore < 0 || minScore > 1) {
      throw new RangeError("minScore must be between zero and one");
    }
    this.dwellThreshold = dwellThreshold;
    this.maxGap = maxGap;
    this.minScore = minScore;
    this.reset();
  }

  reset() {
    this._tracks = new Map();
    this._visibleIds = new Set();
    this._lastTime = null;
    this._nextId = 1;
  }

  update(detections, mediaTime) {
    if (!Array.isArray(detections))
      throw new TypeError("detections must be an array");
    if (!finite(mediaTime) || mediaTime < 0) {
      throw new RangeError(
        "mediaTime must be a finite, nonnegative number of seconds",
      );
    }
    let didReset = false;
    if (
      this._lastTime !== null &&
      (mediaTime < this._lastTime || mediaTime - this._lastTime > this.maxGap)
    ) {
      this.reset();
      didReset = true;
    }
    const elapsed = this._lastTime === null ? 0 : mediaTime - this._lastTime;
    for (const [id, track] of this._tracks) {
      if (mediaTime - track.lastSeen > this.maxGap) this._tracks.delete(id);
    }

    const valid = detections.filter((detection) =>
      usableDetection(detection, this.minScore),
    );
    const candidates = [];
    for (const track of this._tracks.values()) {
      valid.forEach((detection, detectionIndex) => {
        const displacement = distance(
          center(track.bbox),
          center(detection.bbox),
        );
        const size = Math.max(
          Math.hypot(track.bbox[2], track.bbox[3]),
          Math.hypot(detection.bbox[2], detection.bbox[3]),
        );
        const distanceGate = Math.min(0.18, Math.max(0.06, size * 0.5));
        const iou = intersectionOverUnion(track.bbox, detection.bbox);
        if (
          (iou >= 0.1 && displacement <= 0.25) ||
          displacement <= distanceGate
        ) {
          candidates.push({
            id: track.id,
            detectionIndex,
            quality: iou - displacement,
          });
        }
      });
    }
    candidates.sort((a, b) => b.quality - a.quality);
    const assignedTracks = new Set();
    const assignments = new Map();
    for (const candidate of candidates) {
      if (
        assignedTracks.has(candidate.id) ||
        assignments.has(candidate.detectionIndex)
      )
        continue;
      assignedTracks.add(candidate.id);
      assignments.set(candidate.detectionIndex, candidate.id);
    }

    const visible = [];
    const events = [];
    valid.forEach((detection, detectionIndex) => {
      const foot = footPoint(detection.bbox);
      const zone = this.zones.find((item) => containsPoint(item.polygon, foot));
      const zoneId = zone?.id ?? null;
      let track = this._tracks.get(assignments.get(detectionIndex));
      if (!track) {
        track = {
          id: `track-${this._nextId++}`,
          dwell: 0,
          zoneId,
          emitted: false,
          trail: [],
          visitSequence: zoneId === null ? 0 : 1,
        };
      } else if (track.zoneId !== zoneId) {
        track.dwell = 0;
        track.emitted = false;
        if (zoneId !== null) track.visitSequence += 1;
      } else if (zoneId !== null && this._visibleIds.has(track.id)) {
        track.dwell += elapsed;
      }

      track.bbox = [...detection.bbox];
      track.score = detection.score;
      track.zoneId = zoneId;
      track.zoneName = zone?.name ?? null;
      track.visit_id =
        zoneId === null ? null : `${track.id}:visit-${track.visitSequence}`;
      track.lastSeen = mediaTime;
      if (!track.trail.length || distance(track.trail.at(-1), foot) > EPSILON) {
        track.trail.push(foot);
        if (track.trail.length > MAX_TRAIL_POINTS) track.trail.shift();
      }
      if (
        zoneId !== null &&
        !track.emitted &&
        track.dwell + EPSILON >= this.dwellThreshold
      ) {
        track.emitted = true;
        events.push({
          event_type: "person_dwell_detected",
          track_id: track.id,
          visit_id: track.visit_id,
          zone_id: zoneId,
          zone_name: track.zoneName,
          media_time_s: mediaTime,
          duration_s: track.dwell,
          confidence: track.score,
        });
      }
      this._tracks.set(track.id, track);
      visible.push({
        id: track.id,
        bbox: [...track.bbox],
        score: track.score,
        zoneId,
        zoneName: track.zoneName,
        dwell: track.dwell,
        visit_id: track.visit_id,
        trail: track.trail.map((point) => [...point]),
      });
    });

    this._visibleIds = new Set(visible.map((track) => track.id));
    this._lastTime = mediaTime;
    const zoneStats = this.zones.map((zone) => {
      const observed = visible.filter((track) => track.zoneId === zone.id);
      return {
        id: zone.id,
        name: zone.name,
        count: observed.length,
        maxDwell: observed.reduce(
          (maximum, track) => Math.max(maximum, track.dwell),
          0,
        ),
      };
    });
    return { tracks: visible, events, zoneStats, reset: didReset };
  }
}
