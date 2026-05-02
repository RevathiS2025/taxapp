import { useEffect, useRef, useState } from 'react'
import { useTax } from '../context/TaxContext'
import { computeTax, formatINR } from '../engine/taxEngine'
import LivePreview from './LivePreview'

export default function MobileEstimateSheet() {
  const { state } = useTax()
  const [result, setResult] = useState(null)
  const [open, setOpen] = useState(false)
  const closeRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setResult(state.monthlyTakeHome ? computeTax(state) : null)
    }, 300)
    return () => clearTimeout(timer)
  }, [state])

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      closeRef.current?.focus()
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  if (!result) return null

  const { newRegime: nr, oldRegime: or, savings, winner } = result
  const bestTax = winner === 'new' ? nr.totalTax : or.totalTax

  return (
    <>
      {/* Sticky bottom bar — mobile only */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-neutral-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="View live tax estimate"
          aria-haspopup="dialog"
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="text-left">
            <p className="text-[11px] text-neutral-500 leading-none mb-0.5">
              {winner === 'new' ? 'New Regime wins' : winner === 'old' ? 'Old Regime wins' : 'Both equal'} · est. annual tax
            </p>
            <p className="text-base font-bold text-neutral-900 tabular-nums leading-tight">
              {formatINR(bestTax)}
              <span className="text-xs text-neutral-500 font-normal"> / yr</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {winner !== 'tie' && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  winner === 'new' ? 'bg-success-light text-success' : 'bg-primary-light text-primary'
                }`}
              >
                Save {formatINR(savings)}
              </span>
            )}
            <svg
              className="w-4 h-4 text-neutral-400"
              fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          </div>
        </button>
      </div>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Live tax estimate details"
        className={`lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle + close */}
        <div className="relative flex items-center justify-center pt-3 pb-2 border-b border-neutral-100">
          <div className="w-10 h-1 rounded-full bg-neutral-200" aria-hidden="true" />
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close estimate sheet"
            className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content — render LivePreview without its card wrapper */}
        <div className="overflow-y-auto max-h-[70vh] p-4 pb-8">
          <LivePreview noCard />
        </div>
      </div>
    </>
  )
}
