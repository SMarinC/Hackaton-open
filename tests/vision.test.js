import test from "node:test";
import assert from "node:assert/strict";
import { VideoAnalyzer } from "../src/vision.js";

const prediction = { class: "person", score: 0.9, bbox: [64, 36, 128, 216] };

// No model download, browser, camera, timers or real video is involved here.
// Deferred predictions exercise the asynchronous lifecycle of the actual analyzer.
function harness(t) {
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
      return { width: 0, height: 0, getContext: () => ({ drawImage() {} }) };
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
