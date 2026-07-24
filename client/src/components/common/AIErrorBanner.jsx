// Shared error banner for AI-powered features (Chat, Notes, Assignments AI Prioritize).
// Auto-detects quota/rate-limit language so users get a clearer icon + tone
// without every caller needing to duplicate that detection.
export default function AIErrorBanner({ message, onRetry, onDismiss }) {
  if (!message) return null;

  const lower = message.toLowerCase();
  const isQuota = lower.includes("quota") || lower.includes("limit") || lower.includes("try again tomorrow");
  const icon = isQuota ? "⏳" : "⚠️";

  return (
    <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-sm">
      <span className="text-base leading-none shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-rose-700 leading-snug">{message}</p>
        {isQuota && (
          <p className="text-rose-400 text-xs mt-1">
            This resets daily, or you can upgrade the API plan for higher limits.
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline underline-offset-2"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-rose-400 hover:text-rose-600 text-base font-bold leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}