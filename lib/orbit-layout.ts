/**
 * Hero avatar layout: a lens-shaped block of rows — short at the top and
 * bottom, widest in the middle — which CSS then tilts up to the right to
 * follow the paint-brush backdrop. Every avatar is placed (none are hidden),
 * so the row sizes adapt to however many avatars there are.
 *
 *   28 avatars -> 3, 5, 6, 6, 5, 3
 *   19 avatars -> 3, 4, 5, 4, 3
 */
export function lensRowSizes(total: number): number[] {
  if (total <= 0) return [];
  const rows = Math.max(1, Math.round(Math.sqrt(total / 0.8)));
  if (rows === 1) return [total];

  // Weight each row by a flattened parabola, then scale to the total and
  // round with the largest-remainder method so the sizes add up exactly.
  const weights = Array.from({ length: rows }, (_, k) => {
    const t = (k - (rows - 1) / 2) / (rows / 2);
    return 0.45 + 0.55 * (1 - t * t);
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  const exact = weights.map((w) => (w / sum) * total);
  const sizes = exact.map(Math.floor);
  let left = total - sizes.reduce((a, b) => a + b, 0);
  exact
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac)
    .slice(0, left)
    .forEach(({ i }) => { sizes[i] += 1; left -= 1; });
  return sizes;
}

/** Position of every avatar, in reading order: `u` along its row, `v` = row, both centred on 0. */
export function lensPositions(total: number): { u: number; v: number }[] {
  const sizes = lensRowSizes(total);
  const out: { u: number; v: number }[] = [];
  sizes.forEach((count, row) => {
    for (let i = 0; i < count; i += 1) out.push({ u: i - (count - 1) / 2, v: row - (sizes.length - 1) / 2 });
  });
  return out;
}
