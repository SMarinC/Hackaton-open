import test from "node:test";
import assert from "node:assert/strict";
import { VideoAnalyzer } from "../src/vision.js";

const prediction = { class: "person", score: 0.9, bbox: [64, 36, 128, 216] };

// No model download, browser, camera, timers or real video is involved here.
// Deferred predictions exercise the asynchronous lifecycle of the actual analyzer.
function harness(t, { readableCanvas = false, texturedCanvas = false, zones = null } = {}) {
  const keys = [
    "document",
    "performance",
    "requestAnimationFrame",
    "cancelAnimationFrame",
  ];
  const originals = new Map(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  const callbacks = new Map();
  const requests = [];
  const frames = [];
  const errors = [];
  let now = 1000;
  let nextFrameId = 1;
  let analyzer;
  const install = (key, value) =>
    Object.defineProperty(globalThis, key, {
      value,
      writable: true,
      configurable: true,
    });
  t.after(() => {
    analyzer?.stop();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  install("document", {
    createElement(tag) {
      assert.equal(tag, "canvas");
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          drawImage() {},
          ...(readableCanvas
            ? {
                getImageData: (x, y, w, h) => {
                  const data = new Uint8ClampedArray(w * h * 4);
                  for (let i = 0; i < data.length; i += 4) {
                    data[i] = 100;
                    data[i + 1] = 150;
                    data[i + 2] = 200;
                    data[i + 3] = 255;
                  }
                  return { data, width: w, height: h };
                },
              }
            : {}),
          ...(texturedCanvas
            ? {
                // A deterministic checkerboard, so edge activity is positive
                // and identical for any two samples of the same size.
                getImageData: (x, y, w, h) => {
                  const data = new Uint8ClampedArray(w * h * 4);
                  for (let py = 0; py < h; py++) {
                    for (let px = 0; px < w; px++) {
                      const offset = (py * w + px) * 4;
                      const on = (px + py) % 2 === 0;
                      data[offset] = data[offset + 1] = data[offset + 2] = on
                        ? 220
                        : 20;
                      data[offset + 3] = 255;
                    }
                  }
                  return { data, width: w, height: h };
                },
              }
            : {}),
        }),
      };
    },
  });
  install("performance", { now: () => now });
  install("requestAnimationFrame", (callback) => {
    const id = nextFrameId++;
    callbacks.set(id, callback);
    return id;
  });
  install("cancelAnimationFrame", (id) => callbacks.delete(id));
  const video = {
    paused: false,
    ended: false,
    seeking: false,
    readyState: 3,
    currentTime: 1,
    videoWidth: 640,
    videoHeight: 360,
  };
  analyzer = new VideoAnalyzer(video, {
    onFrame: (frame) => frames.push(frame),
    onError: (error) => errors.push(error),
    onStatus() {},
    ...(zones ? { getZones: () => zones } : {}),
  });
  analyzer.model = {
    detect() {
      return new Promise((resolve, reject) =>
        requests.push({ resolve, reject }),
      );
    },
  };
  return {
    analyzer,
    video,
    callbacks,
    requests,
    frames,
    errors,
    nextFrame() {
      assert.equal(
        callbacks.size,
        1,
        "Exactly one animation-frame loop must be pending",
      );
      const [id, callback] = callbacks.entries().next().value;
      callbacks.delete(id);
      now += 200; // Advance the deterministic sampling clock beyond its throttle.
      callback(now);
    },
  };
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

for (const outcome of ["rejection", "success"]) {
  test(`a stale ${outcome} after stop/start cannot stop or duplicate the new loop`, async (t) => {
    const h = harness(t);
    h.analyzer.start();
    assert.equal(h.requests.length, 1);
    assert.equal(h.callbacks.size, 0, "Inference is still awaiting its result");

    h.analyzer.stop();
    h.video.currentTime = 2;
    h.analyzer.start();
    assert.equal(
      h.callbacks.size,
      1,
      "The new run waits while the old inference is in flight",
    );
    const newLoopFrame = [...h.callbacks.keys()];

    if (outcome === "rejection")
      h.requests[0].reject(new Error("Failure from the previous source"));
    else h.requests[0].resolve([prediction]);
    await flushMicrotasks();

    assert.equal(
      h.analyzer.running,
      true,
      "Old completion must not stop the current run",
    );
    assert.deepEqual(
      h.errors,
      [],
      "Old-source failures must not reach the current UI",
    );
    assert.deepEqual(
      h.frames,
      [],
      "Old-source detections must not create observations",
    );
    assert.deepEqual(
      [...h.callbacks.keys()],
      newLoopFrame,
      "Old completion must neither cancel nor append to the new animation-frame loop",
    );

    h.nextFrame();
    assert.equal(
      h.requests.length,
      2,
      "The current run can sample after old inference settles",
    );
    h.requests[1].resolve([prediction]);
    await flushMicrotasks();
    assert.equal(h.frames.length, 1);
    assert.equal(h.frames[0].mediaTime, 2);
    assert.equal(h.callbacks.size, 1);

    h.nextFrame();
    assert.equal(
      h.requests.length,
      2,
      "A repeated media timestamp must not be sampled again",
    );
    assert.equal(h.callbacks.size, 1);
  });
}

test("reset during inference discards stale detections and keeps the same loop sampling", async (t) => {
  const h = harness(t);
  h.analyzer.start();
  assert.equal(h.requests.length, 1);

  h.video.currentTime = 5;
  h.analyzer.reset();
  h.requests[0].resolve([prediction]);
  await flushMicrotasks();

  assert.equal(h.analyzer.running, true);
  assert.deepEqual(h.frames, []);
  assert.deepEqual(h.errors, []);
  assert.equal(
    h.callbacks.size,
    1,
    "A measurement reset must not interrupt the active loop",
  );

  h.nextFrame();
  assert.equal(h.requests.length, 2);
  h.requests[1].resolve([prediction]);
  await flushMicrotasks();

  assert.equal(h.frames.length, 1);
  assert.equal(h.frames[0].mediaTime, 5);
  assert.deepEqual(h.errors, []);
  assert.equal(h.callbacks.size, 1);
});

test("detections carry no appearance signature when the canvas cannot be read", async (t) => {
  const h = harness(t);
  h.analyzer.start();
  h.requests[0].resolve([prediction]);
  await flushMicrotasks();
  assert.equal(h.frames.length, 1);
  assert.equal(h.frames[0].detections[0].appearance, undefined);
});

test("a readable canvas attaches a local per-cell color signature to each person detection", async (t) => {
  const h = harness(t, { readableCanvas: true });
  h.analyzer.start();
  h.requests[0].resolve([prediction]);
  await flushMicrotasks();
  assert.equal(h.frames.length, 1);
  const [detection] = h.frames[0].detections;
  assert.ok(Array.isArray(detection.appearance));
  // 3 rows x 2 cols x 3 channels, and every pixel is the same solid color.
  assert.deepEqual(detection.appearance, new Array(6).fill([100, 150, 200]).flat());
});

const shelfZone = {
  id: "shelf-1",
  name: "Estante 1",
  polygon: [
    [0.1, 0.1],
    [0.4, 0.1],
    [0.4, 0.4],
    [0.1, 0.4],
  ],
};

test("without configured zones, frames carry no shelf occupancy readings", async (t) => {
  const h = harness(t, { readableCanvas: true });
  h.analyzer.start();
  h.requests[0].resolve([prediction]);
  await flushMicrotasks();
  assert.deepEqual(h.frames[0].shelfOccupancy, []);
});

test("a zone reads unknown occupancy (never a misleading zero) until a baseline is captured", async (t) => {
  const h = harness(t, { readableCanvas: true, zones: [shelfZone] });
  h.analyzer.start();
  h.requests[0].resolve([prediction]);
  await flushMicrotasks();
  assert.equal(h.frames[0].shelfOccupancy.length, 1);
  const [reading] = h.frames[0].shelfOccupancy;
  assert.equal(reading.zoneId, "shelf-1");
  assert.equal(reading.score, null, "no baseline captured yet");
});

test("capturing a baseline scores an unchanged scene at full occupancy", async (t) => {
  const h = harness(t, { texturedCanvas: true, zones: [shelfZone] });
  h.analyzer.start();
  h.requests[0].resolve([prediction]);
  await flushMicrotasks();

  const captured = h.analyzer.captureShelfBaseline();
  assert.equal(captured, 1, "one zone got a baseline");

  h.video.currentTime = 2;
  h.nextFrame();
  h.requests[1].resolve([prediction]);
  await flushMicrotasks();
  assert.equal(h.frames[1].shelfOccupancy[0].score, 1);
});

test("a reset clears the shelf baseline so a new scene is never scored against a stale one", async (t) => {
  const h = harness(t, { readableCanvas: true, zones: [shelfZone] });
  h.analyzer.start();
  h.requests[0].resolve([prediction]);
  await flushMicrotasks();
  h.analyzer.captureShelfBaseline();

  h.video.currentTime = 5;
  h.analyzer.reset();
  h.nextFrame();
  h.requests[1].resolve([prediction]);
  await flushMicrotasks();
  assert.equal(h.frames[1].shelfOccupancy[0].score, null);
});
