const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
)
const ArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
)

export default function StepNav({ onBack, onNext, nextDisabled = false, nextLabel = 'Next' }) {
  return (
    <div className="mt-8 flex items-center gap-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back to previous step"
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-gray-400 font-medium text-sm hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft aria-hidden="true" />
          Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        aria-label={nextDisabled ? 'Complete this step to continue' : nextLabel}
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-neutral-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-sm"
      >
        {nextLabel}
        <ArrowRight aria-hidden="true" />
      </button>
    </div>
  )
}
