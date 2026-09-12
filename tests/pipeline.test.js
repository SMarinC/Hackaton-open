import test from "node:test";
import assert from "node:assert/strict";
import { ZoneTracker } from "../src/tracker.js";
import { createStore } from "../server/store.js";

// These normalized detections are explicit fixtures, not COCO-SSD predictions.
// The tests establish tracking/persistence contracts, not real detector accuracy.
const fixtureZone = {
  id: "fixture-aisle",
  name: "Sección de prueba",
  polygon: [
    [0, 0.5],
    [1, 0.5],
    [1, 1],
    [0, 1],
  ],
};
const threshold = 8;
const inside = () => [
  { class: "person", score: 0.9, bbox: [0.4, 0.3, 0.1, 0.25] },
];
const outside = () => [
  { class: "person", score: 0.9, bbox: [0.4, 0.2, 0.1, 0.25] },
];

function fixtureSession(t) {
  const store = createStore({ filename: ":memory:" });
  t.after(() => store.close());
  return {
    store,
    tracker: new ZoneTracker({
      zones: [fixtureZone],
      dwellThreshold: threshold,
    }),
  };
}

function envelope(event, runId) {
  const sourceId = "fixture-normalized-trajectory";
  return {
    ...event,
    run_id: runId,
    source_id: sourceId,
    event_id: `${runId}:${sourceId}:${event.visit_id}:${event.event_type}`,
    detector: "fixture-normalized-person-boxes-v1",
    threshold_s: threshold,
    zone_polygon: fixtureZone.polygon.map((point) => [...point]),
  };
}

function firstFixtureVisit(subject) {
  const emitted = [];
  for (let mediaTime = 2; mediaTime <= 10; mediaTime += 1) {
    const update = subject.update(inside(), mediaTime);
    assert.equal(update.reset, false);
    if (mediaTime < 10) assert.equal(update.events.length, 0);
    emitted.push(...update.events);
  }
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].media_time_s, 10);
  assert.equal(emitted[0].duration_s, 8);
  return emitted[0];
}

test("fixture trajectory produces an idempotent case, typed human closure and unsent reports; reentry is a new case", (t) => {
  const { store, tracker } = fixtureSession(t);
  const firstEvent = firstFixtureVisit(tracker);
  const payload = envelope(firstEvent, "fixture-run-1");
  const initial = store.ingest(payload);
  assert.equal(initial.created, true);
  assert.equal(initial.case.status, "review_required");
  assert.equal(initial.case.inventory.status, "unknown");
  assert.equal(initial.case.task, null);
  assert.equal(initial.case.source.visit_id, firstEvent.visit_id);
  assert.equal(initial.case.source.detector, payload.detector);
  assert.equal(initial.case.source.threshold_s, threshold);
  assert.deepEqual(initial.case.source.zone_polygon, fixtureZone.polygon);
  const caseId = initial.case.id;

  const redelivery = store.ingest(structuredClone(payload));
  assert.equal(redelivery.duplicate, true);
  assert.equal(redelivery.case.id, caseId);
  assert.equal(store.listCases().length, 1);
  assert.equal(store.listOutbox().length, 1);

  // Neither dwell nor stock alone proves a shelf issue. This is a simulated
  // local operator observation, explicitly separate from the detector fixture.
  assert.throws(
    () =>
      store.observe(caseId, {
        request_id: "fixture-stock-without-shelf-confirmation",
        expected_version: initial.case.version,
        kind: "stock_confirmed",
        note: "Fixture: stock disponible; incidencia aún no confirmada.",
      }),
    (error) => error.status === 400,
  );
  assert.equal(store.getCase(caseId).status, "review_required");
  const assigned = store.observe(caseId, {
    request_id: "fixture-confirm-stock",
    expected_version: initial.case.version,
    kind: "stock_confirmed",
    shelf_issue_confirmed: true,
    note: "Fixture: operador confirma incidencia en exhibición y stock disponible para reponer.",
  }).case;
  assert.equal(assigned.status, "assigned");
  assert.equal(assigned.observations[0].shelf_issue_confirmed, true);
  assert.equal(assigned.inventory.source, "fixture");
  assert.equal(assigned.task.sku, null);
  assert.equal(assigned.task.quantity, null);

  const closureObservation = {
    request_id: "fixture-confirm-restocked",
    expected_version: assigned.version,
    kind: "restocked",
    note: "Fixture: el operador local informa reposición completada.",
  };
  const closed = store.observe(caseId, closureObservation).case;
  assert.equal(closed.status, "closed");
  assert.equal(closed.closure.modality, "local_human_confirmation");
  assert.equal(closed.closure.visual_verification, false);
  const reports = store
    .listOutbox()
    .filter(
      (message) => message.case_id === caseId && message.intent === "report",
    );
  assert.deepEqual(reports.map((message) => message.channel).sort(), [
    "email",
    "slack",
  ]);
  for (const report of reports) {
    assert.equal(report.status, "pending_connection");
    assert.equal(report.delivery_confirmed, false);
    assert.equal(report.provider_id, null);
    assert.equal(report.attempts, 0);
  }
  const outboxCount = store.listOutbox().length;
  assert.equal(
    store.observe(caseId, structuredClone(closureObservation)).duplicate,
    true,
  );
  assert.equal(store.ingest(structuredClone(payload)).duplicate, true);
  assert.equal(store.listOutbox().length, outboxCount);

  // An observed exit and reentry retain the geometric track but start a new
  // visit. A short absent-detection gap would instead retain its visit_id.
  assert.equal(tracker.update(outside(), 10.5).tracks[0].zoneId, null);
  const entry = tracker.update(inside(), 11);
  assert.equal(entry.tracks[0].id, firstEvent.track_id);
  assert.notEqual(entry.tracks[0].visit_id, firstEvent.visit_id);
  assert.equal(entry.tracks[0].dwell, 0);
  const secondEvents = [];
  for (let mediaTime = 12; mediaTime <= 19; mediaTime += 1) {
    secondEvents.push(...tracker.update(inside(), mediaTime).events);
  }
  assert.equal(secondEvents.length, 1);
  assert.equal(secondEvents[0].track_id, firstEvent.track_id);
  assert.notEqual(secondEvents[0].visit_id, firstEvent.visit_id);
  const second = store.ingest(envelope(secondEvents[0], "fixture-run-1"));
  assert.equal(second.created, true);
  assert.notEqual(second.case.id, caseId);
  assert.equal(second.case.status, "review_required");
  assert.equal(store.listCases().length, 2);
  assert.deepEqual(store.getCase(caseId), closed);
});

test("paused fixture replay does not add dwell; backward seek uses a new run and preserves previous cases", (t) => {
  const { store, tracker } = fixtureSession(t);
  const firstEvent = firstFixtureVisit(tracker);
  const first = store.ingest(
    envelope(firstEvent, "fixture-run-before-seek"),
  ).case;
  const preserved = structuredClone(first);

  for (let i = 0; i < 20; i += 1) {
    const paused = tracker.update(inside(), 10);
    assert.equal(paused.tracks[0].dwell, 8);
    assert.equal(paused.events.length, 0);
    assert.equal(paused.reset, false);
  }
  assert.equal(store.listCases().length, 1);
  assert.equal(store.listOutbox().length, 1);

  const sought = tracker.update(inside(), 4);
  assert.equal(sought.reset, true);
  assert.equal(sought.tracks[0].dwell, 0);
  assert.equal(sought.events.length, 0);
  // This is the caller's responsibility when the tracker reports a reset.
  const newRunId = "fixture-run-after-seek";
  const newEvents = [];
  for (let mediaTime = 5; mediaTime <= 12; mediaTime += 1) {
    const update = tracker.update(inside(), mediaTime);
    if (mediaTime < 12) assert.equal(update.events.length, 0);
    newEvents.push(...update.events);
  }
  assert.equal(newEvents.length, 1);
  assert.equal(newEvents[0].duration_s, 8);
  // Run-local identifiers can repeat. The run_id prevents merging separate replays.
  assert.equal(newEvents[0].track_id, firstEvent.track_id);
  assert.equal(newEvents[0].visit_id, firstEvent.visit_id);
  const next = store.ingest(envelope(newEvents[0], newRunId));
  assert.equal(next.created, true);
  assert.notEqual(next.case.id, first.id);
  assert.equal(store.listCases().length, 2);
  assert.equal(store.listOutbox().length, 2);
  assert.deepEqual(store.getCase(first.id), preserved);
});
