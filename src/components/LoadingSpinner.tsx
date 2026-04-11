interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = 'AI가 운명을 직조하고 있습니다...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24">
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          style={{ animation: 'spin 3s linear infinite' }}
        />
        <div
          className="absolute inset-0 rounded-full border-t-2 border-primary"
          style={{ animation: 'spin 1.5s linear infinite' }}
        />
        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-primary text-2xl">
          auto_stories
        </span>
      </div>
      <p className="font-label text-[10px] uppercase tracking-[0.4em] text-on-surface/50 animate-pulse">
        {message}
      </p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
