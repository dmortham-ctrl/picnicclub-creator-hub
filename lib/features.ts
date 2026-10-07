/**
 * Feature switches. Flip a flag to turn a feature off (or back on) site-wide
 * without deleting any code or data.
 *
 * RATECARD_ENABLED — the Rate Card generator + the "ratecard" minisite block.
 * When false: the dashboard menu, the "add block" option, the AI endpoint and
 * the public rendering are all hidden. Existing rate-card rows stay untouched
 * in the database, so turning it back on restores them as-is.
 */
export const RATECARD_ENABLED = false;
