// A local, unvalidated heuristic for "does this shelf region look emptier
// than it did earlier", never a product classifier and never a count of
// specific items. It compares coarse edge/contrast activity now against a
// baseline captured earlier from the same camera and region. A flat, bare
// shelf or its backing reads as low activity; a densely stocked shelf reads
// as high activity. Lighting changes, reflections and camera moves can all
// fool it — this is explicitly a heuristic, not a validated measurement.

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Mean absolute difference between horizontally adjacent pixels' luminance,
// as a cheap stand-in for edge density.
export function edgeActivity({ data, width, height }) {
  if (!data || !(width > 1) || !(height > 0)) return 0;
  let total = 0;
  let count = 0;
  for (let y = 0; y < height; y++) {
    let previous = null;
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const value = luminance(data[offset], data[offset + 1], data[offset + 2]);
      if (previous !== null) {
        total += Math.abs(value - previous);
        count++;
      }
      previous = value;
    }
  }
  return count ? total / count : 0;
}

// Score in [0, 1]: 1 means "as active/full as the baseline or more", 0 means
// "flat relative to the baseline". Null when there is no positive baseline
// to compare against yet — callers must treat that as "unknown", never zero.
export function occupancyScore(activity, baselineActivity) {
  if (!(baselineActivity > 0)) return null;
  if (!(activity >= 0)) return null;
  return Math.max(0, Math.min(1, activity / baselineActivity));
}
