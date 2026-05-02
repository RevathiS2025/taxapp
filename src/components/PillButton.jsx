export default function PillButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}
