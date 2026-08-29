// Single choke point for error reporting. Today it just logs; when an error
// monitoring service is added (e.g. Sentry), wire it in here and nothing else
// in the app needs to change.
export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.error("[reportError]", error, context ?? "");
  } else {
    console.error("[reportError]", error instanceof Error ? error.message : String(error), context ?? "");
  }
}
