import test from "node:test";
import assert from "node:assert/strict";
import { edgeActivity, occupancyScore } from "../src/shelf-occupancy.js";

function solidImage(width, height, [r, g, b]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  return { data, width, height };
}

function checkerboard(width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const on = (x + y) % 2 === 0;
      data[offset] = data[offset + 1] = data[offset + 2] = on ? 255 : 0;
      data[offset + 3] = 255;
    }
  }
  return { data, width, height };
}

test("a uniform region has zero edge activity", () => {
  assert.equal(edgeActivity(solidImage(8, 8, [120, 120, 120])), 0);
});

test("a high-contrast region has far more edge activity than a uniform one", () => {
  const flat = edgeActivity(solidImage(8, 8, [200, 200, 200]));
  const busy = edgeActivity(checkerboard(8, 8));
  assert.ok(busy > flat);
  assert.ok(busy > 100, "alternating black/white pixels should read as strongly active");
});

test("degenerate regions read as zero activity instead of throwing", () => {
  assert.equal(edgeActivity({ data: new Uint8ClampedArray(0), width: 0, height: 0 }), 0);
  assert.equal(edgeActivity({ data: null, width: 4, height: 4 }), 0);
  assert.equal(edgeActivity({ data: new Uint8ClampedArray(16), width: 1, height: 4 }), 0);
});

test("occupancy score is 1 at the baseline and clamps above it", () => {
  assert.equal(occupancyScore(50, 50), 1);
  assert.equal(occupancyScore(90, 50), 1, "more activity than the baseline still reads as fully stocked, never over 1");
});

test("occupancy score falls toward zero as activity drops below the baseline", () => {
  assert.equal(occupancyScore(25, 50), 0.5);
  assert.equal(occupancyScore(0, 50), 0);
});

test("occupancy score is null without a positive baseline, never a misleading zero", () => {
  assert.equal(occupancyScore(10, 0), null);
  assert.equal(occupancyScore(10, -5), null);
  assert.equal(occupancyScore(10, undefined), null);
  assert.equal(occupancyScore(NaN, 50), null);
});
