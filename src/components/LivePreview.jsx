import { useEffect, useRef, useState } from 'react'
import { useTax } from '../context/TaxContext'
import { computeTax, formatINR } from '../engine/taxEngine'

function Row({ label, old, new: newVal, bold }) {
  return (
    <div className={`grid grid-cols-3 items-center py-1.5 px-1 rounded ${bold ? 'font-semibold' : ''}`}>
      <span className={`text-xs ${bold ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-gray-400'}`}>{label}</span>
      <span className={`text-right text-xs tabular-nums ${bold ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-gray-400'}`}>{old}</span>
      <span className={`text-right text-xs tabular-nums ${bold ? 'text-primary font-bold' : 'text-neutral-600 dark:text-gray-400'}`}>{newVal}</span>
    </div>
  )
}

function MiniSlabTable({ regime }) {
  const { slabBreakdown, rebate, rawTax, effectiveTax, cess, totalTax } = regime
  const marginalRelief = rebate === 0 && effectiveTax < rawTax ? rawTax - effectiveTax : 0

  return (
    <div className="text-xs">
      <div className="grid grid-cols-3 gap-1 px-1 mb-1 text-[10px] font-semibold text-neutral-400 dark:text-gray-500 uppercase tracking-wide">
        <span>Slab</span>
        <span className="text-right">Rate</span>
        <span className="text-right">Tax</span>
      </div>
      {slabBreakdown.map((row, i) => (
        <div key={i} className="grid grid-cols-3 gap-1 px-1 py-0.5">
          <span className="text-neutral-600 dark:text-gray-400 truncate">{row.label}</span>
          <span className="text-right text-neutral-500 dark:text-gray-500">{Math.round(row.rate * 100)}%</span>
          <span className="text-right text-neutral-700 dark:text-gray-300 tabular-nums">{formatINR(row.tax)}</span>
        </div>
      ))}
      <div className="border-t border-neutral-200 dark:border-gray-700 mt-1 pt-1 space-y-0.5">
        <div className="grid grid-cols-3 gap-1 px-1">
          <span className="text-neutral-500 dark:text-gray-500">Subtotal</span>
          <span />
          <span className="text-right text-neutral-700 dark:text-gray-300 tabular-nums">{formatINR(rawTax)}</span>
        </div>
        {rebate > 0 && (
          <div className="grid grid-cols-3 gap-1 px-1 text-success">
            <span className="col-span-2">87A Rebate</span>
            <span className="text-right tabular-nums">−{formatINR(rebate)}</span>
          </div>
        )}
        {marginalRelief > 0 && (
          <div className="grid grid-cols-3 gap-1 px-1 text-success">
            <span className="col-span-2">Marginal Relief</span>
            <span className="text-right tabular-nums">−{formatINR(marginalRelief)}</span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1 px-1">
          <span className="text-neutral-500 dark:text-gray-500">Cess (4%)</span>
          <span />
          <span className="text-right text-neutral-700 dark:text-gray-300 tabular-nums">{formatINR(cess)}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 px-1 font-semibold">
          <span className="text-neutral-800 dark:text-gray-200">Total Tax</span>
          <span />
          <span className="text-right text-neutral-900 dark:text-white tabular-nums">{formatINR(totalTax)}</span>
        </div>
      </div>
    </div>
  )
}

function DeductionsSummary({ or, nr }) {
  const rows = [
    { label: 'Standard deduction', old: or.standardDeduction, new: nr.standardDeduction },
    { label: 'Professional tax', old: or.profTax, new: nr.profTax },
    { label: 'HRA exemption', old: or.hraExemption, new: 0 },
    { label: '80C (PF + invest.)', old: or.deduction80C, new: 0 },
    { label: 'Health ins. (80D)', old: or.deduction80D, new: 0 },
    { label: 'Home loan int. (24b)', old: or.deduction24b, new: 0 },
    { label: 'NPS employee (80CCD1B)', old: or.deduction80CCD1B, new: 0 },
    { label: 'Employer NPS (80CCD2)', old: or.employerNPS, new: nr.employerNPS },
    { label: 'Savings int. (80TTA/B)', old: or.deduction80TTA + or.deduction80TTB, new: 0 },
  ].filter(r => r.old > 0 || r.new > 0)

  if (rows.length === 0) return <p className="text-xs text-neutral-400 dark:text-gray-600 text-center py-2">No deductions recorded yet.</p>

  const fmtCell = (v, isNew) =>
    v > 0 ? <span className={`tabular-nums ${isNew ? 'text-primary' : 'text-neutral-700 dark:text-gray-300'}`}>{formatINR(v)}</span>
           : <span className="text-neutral-300 dark:text-gray-600">—</span>

  return (
    <div className="text-xs">
      <div className="grid grid-cols-3 gap-1 px-1 mb-1 text-[10px] font-semibold text-neutral-400 dark:text-gray-500 uppercase tracking-wide">
        <span className="col-span-1">Deduction</span>
        <span className="text-right">Old</span>
        <span className="text-right text-primary">New</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-3 gap-1 px-1 py-0.5">
          <span className="text-neutral-600 dark:text-gray-400 truncate">{r.label}</span>
          <span className="text-right">{fmtCell(r.old, false)}</span>
          <span className="text-right">{fmtCell(r.new, true)}</span>
        </div>
      ))}
      <div className="border-t border-neutral-200 dark:border-gray-700 mt-1 pt-1 grid grid-cols-3 gap-1 px-1 font-semibold">
        <span className="text-neutral-800 dark:text-gray-200">Total</span>
        <span className="text-right tabular-nums text-neutral-900 dark:text-white">{formatINR(rows.reduce((s, r) => s + r.old, 0))}</span>
        <span className="text-right tabular-nums text-primary">{formatINR(rows.reduce((s, r) => s + r.new, 0))}</span>
      </div>
    </div>
  )
}

function ExpandSection({ label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3 border border-neutral-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-600 dark:text-gray-400 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span>{label}</span>
        <svg
          className={`w-3.5 h-3.5 text-neutral-400 dark:text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[600px]' : 'max-h-0'}`}>
        <div className="px-3 pb-3 pt-1 border-t border-neutral-100 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function LivePreview({ noCard = false }) {
  const { state } = useTax()
  const [result, setResult] = useState(null)
  const [animKey, setAnimKey] = useState(0)
  const [slabTab, setSlabTab] = useState('new')
  const prevResultRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = state.monthlyTakeHome ? computeTax(state) : null
      if (next !== prevResultRef.current) {
        prevResultRef.current = next
        setResult(next)
        setAnimKey(k => k + 1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [state])

  if (!state.monthlyTakeHome) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-neutral-300 dark:border-gray-700 rounded-2xl shadow-panel p-6 flex flex-col items-center justify-center min-h-[260px] text-center">
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-3">
          <span className="text-primary text-xl font-bold">₹</span>
        </div>
        <p className="text-neutral-600 dark:text-gray-400 text-sm leading-relaxed max-w-[220px]">
          Your live tax estimate will appear here as you answer the questions.
        </p>
      </div>
    )
  }

  if (!result) return null

  const { newRegime: nr, oldRegime: or, savings, winner } = result

  return (
    <div
      role="region"
      aria-label="Live tax estimate"
      className={noCard ? '' : 'bg-white dark:bg-gray-800 border border-neutral-300 dark:border-gray-700 rounded-2xl shadow-panel p-5'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Live Tax Estimate</h3>
        {winner !== 'tie' && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            winner === 'new' ? 'bg-success-light text-success' : 'bg-primary-light text-primary'
          }`}>
            {winner === 'new' ? 'New Regime ↓' : 'Old Regime ↓'}
          </span>
        )}
      </div>

      {/* Gross salary */}
      <div className="mb-3 pb-3 border-b border-neutral-300 dark:border-gray-700">
        <p className="text-xs text-neutral-600 dark:text-gray-400">Estimated Gross Salary</p>
        <p className="text-base font-bold text-neutral-900 dark:text-white tabular-nums">
          {formatINR(nr.grossSalary)}<span className="text-neutral-600 dark:text-gray-400 font-normal text-xs"> / year</span>
        </p>
      </div>

      {/* Summary numbers */}
      <div key={animKey} className="animate-fade-slide-in" aria-live="polite" aria-atomic="true">
        {/* Column headers */}
        <div className="grid grid-cols-3 px-1 mb-1">
          <span />
          <span className="text-right text-[11px] font-semibold text-neutral-500 dark:text-gray-500 uppercase tracking-wide">Old</span>
          <span className="text-right text-[11px] font-semibold text-primary uppercase tracking-wide">New</span>
        </div>

        <Row label="Taxable Income"  old={formatINR(or.taxableIncome)}  new={formatINR(nr.taxableIncome)} />
        <Row label="Tax (pre-cess)"  old={formatINR(or.effectiveTax)}   new={formatINR(nr.effectiveTax)} />
        <Row label="Cess (4%)"       old={formatINR(or.cess)}           new={formatINR(nr.cess)} />

        <div className="border-t border-neutral-300 dark:border-gray-700 my-1.5" />

        <Row label="Total Tax"   old={formatINR(or.totalTax)}  new={formatINR(nr.totalTax)} bold />
        <Row label="Monthly TDS" old={formatINR(or.monthlyTax)} new={formatINR(nr.monthlyTax)} />

        {/* Savings callout */}
        <div className={`mt-4 rounded-xl px-4 py-3 ${
          winner === 'new' ? 'bg-success-light'
          : winner === 'old' ? 'bg-primary-light'
          : 'bg-neutral-100 dark:bg-gray-700'
        }`}>
          {winner === 'tie' ? (
            <p className="text-neutral-600 dark:text-gray-400 text-xs text-center font-medium">Both regimes result in the same tax</p>
          ) : (
            <>
              <p className={`text-sm font-bold tabular-nums ${winner === 'new' ? 'text-success' : 'text-primary'}`}>
                You save {formatINR(savings)} / year
              </p>
              <p className={`text-xs mt-0.5 ${winner === 'new' ? 'text-success' : 'text-primary'}`}>
                with the {winner === 'new' ? 'New' : 'Old'} Regime
              </p>
            </>
          )}
        </div>

        {/* Expandable: Slab Breakdown */}
        <ExpandSection label="Slab Breakdown ▾">
          <div className="flex gap-2 mb-3">
            {['new', 'old'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSlabTab(t)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  slabTab === t
                    ? t === 'new' ? 'bg-primary text-white' : 'bg-neutral-800 text-white'
                    : 'bg-neutral-100 dark:bg-gray-700 text-neutral-600 dark:text-gray-400 hover:bg-neutral-200 dark:hover:bg-gray-600'
                }`}
              >
                {t === 'new' ? 'New Regime' : 'Old Regime'}
              </button>
            ))}
          </div>
          <MiniSlabTable regime={slabTab === 'new' ? nr : or} />
        </ExpandSection>

        {/* Expandable: Deductions Summary */}
        <ExpandSection label="Deductions Summary ▾">
          <DeductionsSummary or={or} nr={nr} />
        </ExpandSection>
      </div>
    </div>
  )
}
