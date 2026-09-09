export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted">
      <span className="animate-pulse">{label}</span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center py-12">
      <p className="font-semibold text-text">{title}</p>
      {description && <p className="text-sm text-muted mt-1">{description}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="font-semibold text-danger">Something went wrong</p>
      <p className="text-sm text-muted mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-sm font-medium px-4 py-2 rounded-lg border border-border text-text hover:bg-surface-alt transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
