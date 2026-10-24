
export function getErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred. Please try again."
): string {
  if (!err) return fallback;

  const anyErr = err as any;

  // 1. Check structured ApiError details array
  const details =
    anyErr?.response?.data?.error?.details || anyErr?.error?.details;
  if (Array.isArray(details) && details.length > 0) {
    const messages = details
      .map((d) => (typeof d === "string" ? d : d?.message))
      .filter((m): m is string => Boolean(m && typeof m === "string"));
    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  // 2. Check ApiError message or response message
  const rawMsg =
    anyErr?.response?.data?.error?.message ||
    anyErr?.response?.data?.message ||
    anyErr?.error?.message ||
    (typeof anyErr?.message === "string" ? anyErr.message : null);

  if (typeof rawMsg === "string" && rawMsg.trim()) {
    const trimmed = rawMsg.trim();

    // Check if the message is a raw JSON string of error objects (e.g. Zod issues array)
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const extracted = parsed
            .map((item) => (typeof item === "string" ? item : item?.message))
            .filter((m): m is string => Boolean(m && typeof m === "string"));
          if (extracted.length > 0) {
            return extracted.join(". ");
          }
        } else if (
          parsed &&
          typeof parsed === "object" &&
          typeof parsed.message === "string"
        ) {
          return parsed.message;
        }
      } catch {
        // Not valid JSON, continue with raw message
      }
    }

    // Common HTTP error replacements for cleaner UX
    if (trimmed === "Network Error" || anyErr?.code === "ECONNABORTED") {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    return trimmed;
  }

  // 3. Fallback based on HTTP status
  const status = anyErr?.response?.status;
  if (status === 400) return "Please check your inputs and try again.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested item or resource could not be found.";
  if (status === 409) return "A record with this information already exists.";
  if (status === 422) return "Some of the provided information is invalid. Please check your inputs.";
  if (status === 429) return "Too many requests. Please slow down and try again shortly.";
  if (status && status >= 500) return "Our server encountered a temporary issue. Please try again in a moment.";

  return fallback;
}

export function getErrorList(
  err: unknown,
  fallback = "An unexpected error occurred. Please try again."
): string[] {
  const message = getErrorMessage(err, fallback);
  if (!message) return [fallback];

  // Split on sentence boundaries if there are multiple concatenated messages
  const parts = message
    .split(/\.\s+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);

  return parts.length > 0 ? parts : [message];
}
