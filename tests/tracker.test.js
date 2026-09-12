import test from "node:test";
import assert from "node:assert/strict";
import { ZoneTracker } from "../src/tracker.js";

const zones = [
  {
    id: "aisle",
    name: "Abarrotes",
    polygon: [
      [0, 0.5],
      [1, 0.5],
      [1, 1],
      [0, 1],
    ],
  },
];
const person = (bbox = [0.3, 0.4, 0.1, 0.3], score = 0.9) => ({
  bbox,
  score,
  class: "person",
});
const tracker = (options = {}) => new ZoneTracker({ zones, ...options });

test("uses the bottom-center foot point and includes polygon boundaries", () => {
  const state = tracker().update([person([0.3, 0.1, 0.1, 0.4])], 0);
  assert.equal(state.tracks[0].zoneId, "aisle");
  assert.equal(state.tracks[0].dwell, 0);
  assert.deepEqual(state.tracks[0].trail, [[0.35, 0.5]]);
  assert.deepEqual(state.zoneStats, [
    { id: "aisle", name: "Abarrotes", count: 1, maxDwell: 0 },
  ]);
});

test("emits exactly at the threshold and only once per visit", () => {
  const subject = tracker({ dwellThreshold: 2 });
  subject.update([person()], 10);
  assert.deepEqual(subject.update([person()], 11).events, []);
  const reached = subject.update([person()], 12);
  assert.deepEqual(reached.events, [
    {
      event_type: "person_dwell_detected",
      track_id: "track-1",
      visit_id: "track-1:visit-1",
      zone_id: "aisle",
      zone_name: "Abarrotes",
      media_time_s: 12,
      duration_s: 2,
      confidence: 0.9,
    },
  ]);
  assert.equal(subject.update([person()], 13).events.length, 0);
  assert.equal(reached.zoneStats[0].maxDwell, 2);
});

test("paused video and repeated timestamps do not accrue dwell", () => {
  const subject = tracker({ dwellThreshold: 1 });
  subject.update([person()], 0);
  subject.update([person()], 0.5);
  for (let i = 0; i < 20; i++) {
    const state = subject.update([person()], 0.5);
    assert.equal(state.tracks[0].dwell, 0.5);
    assert.equal(state.events.length, 0);
  }
  assert.equal(subject.update([person()], 1).events.length, 1);
});

test("backward seeks and large forward jumps start new temporal runs", () => {
  const subject = tracker();
  subject.update([person()], 3);
  subject.update([person()], 4);
  const backwards = subject.update([person()], 2);
  assert.equal(backwards.reset, true);
  assert.equal(backwards.tracks[0].dwell, 0);
  assert.equal(subject.update([person()], 2).reset, false);
  const forwards = subject.update([person()], 6);
  assert.equal(forwards.reset, true);
  assert.equal(forwards.tracks[0].dwell, 0);
  assert.equal(forwards.events.length, 0);
});

test("missed detections keep short-lived identity but never accumulate absent time", () => {
  const subject = tracker({ dwellThreshold: 1.5 });
  const initial = subject.update([person()], 0);
  subject.update([person()], 0.5);
  const absent = subject.update([], 1);
  assert.equal(absent.tracks.length, 0);
  assert.deepEqual(absent.zoneStats, [
    { id: "aisle", name: "Abarrotes", count: 0, maxDwell: 0 },
  ]);
  const recovered = subject.update([person()], 1.5);
  assert.equal(recovered.tracks[0].id, initial.tracks[0].id);
  assert.equal(recovered.tracks[0].visit_id, initial.tracks[0].visit_id);
  assert.equal(recovered.tracks[0].dwell, 0.5);
  assert.equal(recovered.events.length, 0);
  assert.equal(subject.update([person()], 2).tracks[0].dwell, 1);
  const reached = subject.update([person()], 2.5);
  assert.equal(reached.events.length, 1);
  assert.equal(reached.events[0].visit_id, initial.tracks[0].visit_id);
});

test("TTL expiration discards identity and dwell without requiring a playback jump", () => {
  const subject = tracker();
  const initial = subject.update([person()], 0);
  subject.update([], 0.5);
  subject.update([], 1);
  subject.update([], 1.5);
  const returned = subject.update([person()], 2);
  assert.equal(returned.reset, false);
  assert.notEqual(returned.tracks[0].id, initial.tracks[0].id);
  assert.equal(returned.tracks[0].dwell, 0);
});

test("a lost track can be revived by matching appearance within reidWindow, but starts a fresh visit", () => {
  const appearance = [10, 20, 30, 200, 190, 180];
  const subject = tracker({ reidWindow: 4, reidSimilarity: 0.9 });
  const initial = subject.update([{ ...person(), appearance }], 0);
  subject.update([], 0.5);
  subject.update([], 1);
  subject.update([], 1.5);
  const revived = subject.update([{ ...person(), appearance }], 2);
  assert.equal(
    revived.tracks[0].id,
    initial.tracks[0].id,
    "the run-local id survives the gap when appearance matches",
  );
  assert.equal(revived.tracks[0].dwell, 0, "dwell never accrues across the gap");
  assert.notEqual(
    revived.tracks[0].visit_id,
    initial.tracks[0].visit_id,
    "revival always starts a new visit",
  );
});

test("a track lost beyond reidWindow is discarded even with matching appearance", () => {
  const appearance = [10, 20, 30, 200, 190, 180];
  const subject = tracker({ reidWindow: 2, reidSimilarity: 0.9 });
  const initial = subject.update([{ ...person(), appearance }], 0);
  subject.update([], 0.5);
  subject.update([], 1);
  subject.update([], 1.5);
  subject.update([], 2.5);
  const late = subject.update([{ ...person(), appearance }], 3.5);
  assert.notEqual(late.tracks[0].id, initial.tracks[0].id);
});

test("dissimilar appearance does not revive a lost track", () => {
  const subject = tracker({ reidWindow: 4, reidSimilarity: 0.9 });
  const initial = subject.update(
    [{ ...person(), appearance: [0, 0, 0, 0, 0, 0] }],
    0,
  );
  subject.update([], 0.5);
  subject.update([], 1);
  subject.update([], 1.5);
  const different = subject.update(
    [{ ...person(), appearance: [255, 255, 255, 255, 255, 255] }],
    2,
  );
  assert.notEqual(different.tracks[0].id, initial.tracks[0].id);
});

test("revival never engages without an appearance vector on the new detection", () => {
  const subject = tracker({ reidWindow: 4 });
  const initial = subject.update(
    [{ ...person(), appearance: [10, 20, 30] }],
    0,
  );
  subject.update([], 0.5);
  subject.update([], 1);
  subject.update([], 1.5);
  const returned = subject.update([person()], 2);
  assert.notEqual(returned.tracks[0].id, initial.tracks[0].id);
});

test("only the closest appearance match revives a lost track when several detections compete", () => {
  const appearance = [10, 20, 30, 200, 190, 180];
  const subject = tracker({ reidWindow: 4, reidSimilarity: 0.5 });
  const initial = subject.update(
    [{ ...person([0.3, 0.4, 0.1, 0.3]), appearance }],
    0,
  );
  subject.update([], 0.5);
  subject.update([], 1);
  subject.update([], 1.5);
  const close = {
    ...person([0.05, 0.4, 0.1, 0.3]),
    appearance: [12, 22, 28, 198, 188, 182],
  };
  const far = {
    ...person([0.8, 0.4, 0.1, 0.3]),
    appearance: [60, 70, 80, 140, 130, 120],
  };
  const state = subject.update([close, far], 2);
  assert.equal(state.tracks.length, 2);
  const revivedTrack = state.tracks.find((t) => t.id === initial.tracks[0].id);
  assert.ok(revivedTrack, "the closer appearance match revives the lost id");
  const newTrack = state.tracks.find((t) => t.id !== initial.tracks[0].id);
  assert.ok(newTrack, "the weaker match gets a fresh id instead of the lost one");
});

test("explicit exit and reentry reset the visit and allow a new threshold event", () => {
  const subject = tracker({ dwellThreshold: 0.5 });
  const inside = person([0.3, 0.3, 0.1, 0.25]);
  const outside = person([0.3, 0.2, 0.1, 0.25]);
  const id = subject.update([inside], 0).tracks[0].id;
  const firstVisit = subject.update([inside], 0.5);
  assert.equal(firstVisit.events.length, 1);
  const exited = subject.update([outside], 1);
  assert.equal(exited.tracks[0].id, id);
  assert.equal(exited.tracks[0].zoneId, null);
  assert.equal(exited.tracks[0].visit_id, null);
  assert.equal(exited.tracks[0].dwell, 0);
  const reentered = subject.update([inside], 1.5);
  assert.equal(reentered.tracks[0].id, id);
  assert.equal(reentered.tracks[0].dwell, 0);
  assert.notEqual(reentered.tracks[0].visit_id, firstVisit.tracks[0].visit_id);
  assert.equal(reentered.events.length, 0);
  const secondVisit = subject.update([inside], 2);
  assert.equal(secondVisit.events.length, 1);
  assert.equal(secondVisit.events[0].track_id, firstVisit.events[0].track_id);
  assert.notEqual(
    secondVisit.events[0].visit_id,
    firstVisit.events[0].visit_id,
  );
  assert.equal(secondVisit.events[0].visit_id, "track-1:visit-2");
});

test("one old track cannot be assigned to two detections", () => {
  const subject = tracker();
  const original = subject.update([person()], 0).tracks[0].id;
  const state = subject.update([person(), person([0.31, 0.4, 0.1, 0.3])], 0.5);
  assert.equal(state.tracks.length, 2);
  assert.equal(new Set(state.tracks.map((item) => item.id)).size, 2);
  assert.equal(state.tracks.filter((item) => item.id === original).length, 1);
  assert.deepEqual(state.tracks.map((item) => item.dwell).sort(), [0, 0.5]);
});

test("one detection cannot inherit multiple old identities; input order may change", () => {
  const subject = tracker();
  const left = person([0.1, 0.4, 0.1, 0.3]);
  const right = person([0.75, 0.4, 0.1, 0.3]);
  const initial = subject.update([left, right], 0);
  const reversed = subject.update([right, left], 0.5);
  assert.equal(reversed.tracks[0].id, initial.tracks[1].id);
  assert.equal(reversed.tracks[1].id, initial.tracks[0].id);
  assert.equal(subject.update([left], 1).tracks.length, 1);
});

test("distant detections create new identities instead of accumulating another track dwell", () => {
  const subject = tracker();
  const initial = subject.update([person([0.05, 0.4, 0.1, 0.3])], 0);
  const moved = subject.update([person([0.8, 0.4, 0.1, 0.3])], 0.5);
  assert.notEqual(moved.tracks[0].id, initial.tracks[0].id);
  assert.equal(moved.tracks[0].dwell, 0);
});

test("changing zones resets dwell and reports only current per-zone occupancy", () => {
  const subject = new ZoneTracker({
    zones: [
      {
        id: "left",
        name: "Left",
        polygon: [
          [0, 0],
          [0.5, 0],
          [0.5, 1],
          [0, 1],
        ],
      },
      {
        id: "right",
        name: "Right",
        polygon: [
          [0.5, 0],
          [1, 0],
          [1, 1],
          [0.5, 1],
        ],
      },
    ],
  });
  const left = person([0.4, 0.4, 0.1, 0.3]);
  subject.update([left], 0);
  subject.update([left], 1);
  const moved = subject.update([person([0.5, 0.4, 0.1, 0.3])], 1.5);
  assert.equal(moved.tracks[0].zoneId, "right");
  assert.equal(moved.tracks[0].dwell, 0);
  assert.deepEqual(
    moved.zoneStats.map(({ count }) => count),
    [0, 1],
  );
});

test("filters non-person, low-confidence and malformed detections", () => {
  const subject = tracker();
  const state = subject.update(
    [
      null,
      {},
      { ...person(), class: "dog" },
      person(undefined, 0.44),
      person(undefined, NaN),
      person(undefined, 1.1),
      person([-0.1, 0.2, 0.1, 0.3]),
      person([0.3, 0.4, -0.1, 0.3]),
      person([0.3, 0.4, 0.1, Infinity]),
      person([0.9, 0.4, 0.2, 0.3]),
      person([0.3, 0.4, 0, 0.3]),
      person([0.3, 0.4, 0.1]),
      person(undefined, 0.45),
    ],
    0,
  );
  assert.equal(state.tracks.length, 1);
  assert.equal(state.tracks[0].score, 0.45);
});

test("invalid update arguments throw without changing accumulated state", () => {
  const subject = tracker();
  subject.update([person()], 0);
  assert.throws(() => subject.update(null, 0.5), TypeError);
  for (const time of [NaN, Infinity, -1, "1", undefined]) {
    assert.throws(() => subject.update([person()], time), RangeError);
  }
  assert.equal(subject.update([person()], 1).tracks[0].dwell, 1);
});

test("rejects invalid tracker configuration", () => {
  assert.throws(() => new ZoneTracker(), TypeError);
  assert.throws(() => tracker({ zones: [zones[0], zones[0]] }), TypeError);
  assert.throws(
    () =>
      tracker({
        zones: [
          {
            ...zones[0],
            polygon: [
              [0, 0],
              [1, 1],
            ],
          },
        ],
      }),
    TypeError,
  );
  assert.throws(
    () =>
      tracker({
        zones: [
          {
            ...zones[0],
            polygon: [
              [0, 0],
              [0.5, 0.5],
              [1, 1],
            ],
          },
        ],
      }),
    RangeError,
  );
  assert.throws(
    () =>
      tracker({
        zones: [
          {
            ...zones[0],
            polygon: [
              [0, 0],
              [2, 0],
              [1, 1],
            ],
          },
        ],
      }),
    TypeError,
  );
  for (const dwellThreshold of [0, -1, NaN, Infinity]) {
    assert.throws(() => tracker({ dwellThreshold }), RangeError);
  }
  assert.throws(() => tracker({ maxGap: 0 }), RangeError);
  assert.throws(() => tracker({ minScore: -0.1 }), RangeError);
  assert.throws(() => tracker({ minScore: 1.1 }), RangeError);
});

test("explicit reset clears run-local IDs, visits and observations", () => {
  const subject = tracker();
  subject.update([person()], 0);
  subject.update([person()], 1);
  subject.reset();
  const empty = subject.update([], 10);
  assert.equal(empty.reset, false);
  assert.equal(empty.tracks.length, 0);
  assert.equal(empty.zoneStats[0].maxDwell, 0);
  const resumed = subject.update([person()], 10.5);
  assert.equal(resumed.tracks[0].id, "track-1");
  assert.equal(resumed.tracks[0].dwell, 0);
});

test("returned geometry cannot mutate internal tracking state", () => {
  const subject = tracker();
  const initial = subject.update([person()], 0);
  initial.tracks[0].bbox[0] = 0.9;
  initial.tracks[0].trail[0][0] = 0.9;
  const next = subject.update([person()], 0.5);
  assert.equal(next.tracks[0].id, "track-1");
  assert.equal(next.tracks[0].dwell, 0.5);
  assert.deepEqual(next.tracks[0].trail, [[0.35, 0.7]]);
});
