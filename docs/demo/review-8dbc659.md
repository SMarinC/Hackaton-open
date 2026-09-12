# Review of `8dbc659` for the Panela Stocks demo

**Date:** September 12, 2026. **Scope:** `44637af..8dbc659e167199c82924351edd1a2ff6a6db1021`, focused on the new shelf heuristic, initial Slack gate, event contract and their implications for recording. This is a bounded review, not a full security or retail-accuracy audit. No accounts were connected or external messages sent during this review.

## Changes that can be demonstrated

The merge preserves the agreed **Panela Stocks** product name, **PanelaTeam** team identity and immutable opening-event evidence. It also introduces local appearance matching, a manually referenced image-texture comparison, and a condition for preparing the initial Slack review message.

- [Appearance matching](../../src/vision.js) computes a local color signature for detected person crops. The [tracker](../../src/tracker.js) can reuse a recently lost ID within its configured window. A recovered track starts a new visit and restarts dwell. Similar clothing can be confused; this is not verified identity or a proven improvement in counting accuracy.
- [The shelf heuristic](../../src/shelf-occupancy.js) divides current horizontal contrast activity by a positive manually captured reference, clamped to `0..1`. Without a positive reference it returns `null`. [Sampling](../../src/vision.js) uses each zone's rectangular bounds, not an exact polygon mask or product detector. The default zones include circulation and checkout, so the output cannot establish shelf fullness.
- [The event contract](../../server/store.js) accepts optional `shelf_occupancy_score` in `0..1`. A dwell event still creates a review case, but initial `ask_review` is queued only when its score is below `0.6`. Otherwise the case records `shelf_alert_withheld`. The gate runs on case creation; a later event does not automatically reconsider it. Local stock/no-stock confirmations and subsequent messages retain their existing transitions.

## P2 corrected before the rebuilt capture

**Stale shelf reading after reset.** `resetTracking()` cleared the analyzer reference but left the UI's `latestShelfOccupancy` populated. After seeking, changing the source, editing zones or changing the dwell threshold, the paused UI could continue displaying a percentage from the discarded reference until another analyzed frame arrived.

The correction adds only `latestShelfOccupancy = []` before `renderObservations()` in [src/main.js](../../src/main.js). The existing suite was rerun; no new test was added for this one-line UI correction. At the time of validation it was a local change on base `8dbc659`, not a new published commit.

## Remaining P2: incomplete provenance for the new alert condition

The browser sends the derived score but not the captured reference's identity, media timestamp or activity value, nor the current activity value. The server preserves the supplied event faithfully, but that event is insufficient to reconstruct this new comparison independently. Furthermore, the prepared `ask_review` text and initial coordinator reason still explain the decision in terms of dwell, without describing the score that actually admitted the message.

Before treating this as an auditable shelf alert, retain the comparison inputs and reference provenance, identify the heuristic/policy version, and include its actual reason in the case and prepared message. This review did not implement those changes. For the video, describe only an **experimental texture comparison** and do not claim that it proves an empty shelf or explains inventory.

## Recording constraints, not new defects

Marking a reference after a case has already opened will not prepare its initial Slack alert. A low texture reading without a new dwell event does not independently create a case. Show the actual held-message state when those conditions apply.

The stock branches depend on an explicit **local operator** confirmation of both the shelf issue and fictitious stock availability. `stock_confirmed` leads to `assigned`; `restocked` with a note closes only from `assigned`. `no_stock` leads to `awaiting_delivery`, prepares an email query and leaves `task` null when entered directly from review. An existing task can become `blocked_no_stock`; a new stock confirmation is required before replenishment closure. No later visual verification is implemented.

The recording session at `http://127.0.0.1:8790/index.html` uses an isolated database, with Slack and email retaining `pending_connection`. Its prepared messages are not sends. Real incoming replies, email delivery and autonomous follow-up have not been verified in this reviewed workflow. Existing implementation limits remain in the [product definition](../../PRODUCT.md) and [backend documentation](../../server/README.md).

## Separate Slack evidence supplied by the team

After the code review, the team supplied `Downloads/PHOTO-2026-09-12-16-03-53.jpg`. Visual inspection shows a message posted by the **PanelaTeam Agent** application in `#panela-operaciones`, with a demo case, video source `demo-clip`, execution `slack-live-test` and media time `24s`. This supports showing a **separate Slack posting test** in the pitch. The photo remains a local production asset and is not copied into Git.

This is a screenshot of Slack, not an API log. It is not correlated to the recorded cases, the isolated recording database, commit `8dbc659` or the new shelf gate. No incoming response is visible, and it provides no email evidence. The capture should label it **Separate Slack test · team-provided evidence**, while preserving the recorded application's actual pending states. It does not establish bidirectional integration or completion of the intended D0.

## Validation evidence

Executed on the local working copy based on `8dbc659`, after the reset correction:

| Check | Result |
|---|---|
| `npm test` | 74 passed, 0 failed. |
| `npm run build` | Vite production build completed. |
| `npm run check:assets -- --built` | 4 originals and 3 build copies verified; hashes, PNG signature and static SVG checks passed. |
| `git diff --check` | Passed. |

No production database mutation, external delivery test or retail-accuracy benchmark is established by these software checks. The exported MP4 was checked separately as recorded in the pitch document. The associated [English pitch plan](pitch-video-2min-en-v2.md) keeps those distinctions explicit.
