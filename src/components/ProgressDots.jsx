export default function ProgressDots({ current, total = 9 }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const isActive = step === current
        const isDone = step < current
        return (
          <div
            key={i}
            aria-hidden="true"
            className={`rounded-full transition-all duration-200 ${
              isActive ? 'w-6 h-2.5 bg-primary'
              : isDone  ? 'w-2.5 h-2.5 bg-primary/50'
              :           'w-2.5 h-2.5 border-2 border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}
          />
        )
      })}
      <span className="ml-1 text-xs text-neutral-600 dark:text-gray-400 font-medium tabular-nums">
        {current} / {total}
      </span>
    </div>
  )
}
