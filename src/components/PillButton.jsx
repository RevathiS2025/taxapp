export default function PillButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-white dark:bg-gray-700 text-neutral-600 dark:text-gray-300 border-neutral-300 dark:border-gray-600 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}
