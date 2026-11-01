/**
 * Hero avatar layout: straight horizontal rows that alternate 4, 5, 4, 5…
 * avatars, each row centred so the shorter rows sit in the gaps of the longer
 * ones (a brick/honeycomb stagger). Every avatar is placed — none are hidden;
 * if the count doesn't fill the last row it simply ends short, centred.
 *
 *   29 avatars -> 4, 5, 4, 5, 4, 5, 2
 */
export const ORBIT_ROW_PATTERN = [4, 5];

export function orbitRowSizes(total: number): number[] {
  const sizes: number[] = [];
  let left = Math.max(0, total);
  for (let row = 0; left > 0; row += 1) {
    const size = Math.min(ORBIT_ROW_PATTERN[row % ORBIT_ROW_PATTERN.length], left);
    sizes.push(size);
    left -= size;
  }
  return sizes;
}

/** Position of every avatar, in reading order: `u` along its row, `v` = row, both centred on 0. */
export function orbitPositions(total: number): { u: number; v: number }[] {
  const sizes = orbitRowSizes(total);
  const out: { u: number; v: number }[] = [];
  sizes.forEach((count, row) => {
    for (let i = 0; i < count; i += 1) out.push({ u: i - (count - 1) / 2, v: row - (sizes.length - 1) / 2 });
  });
  return out;
}
