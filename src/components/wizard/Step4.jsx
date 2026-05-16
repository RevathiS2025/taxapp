import { useState } from 'react'
import { useTax } from '../../context/TaxContext'
import { formatINR } from '../../engine/taxEngine'
import ProgressDots from '../ProgressDots'
import CurrencyInput from '../CurrencyInput'
import StepNav from '../StepNav'
import FaqAccordion from '../FaqAccordion'

const FAQS = [
  {
    q: 'What is Section 80C and what qualifies?',
    a: 'Section 80C lets you deduct up to ₹1,50,000 from taxable income under the Old Regime. Qualifying investments include EPF/VPF, PPF, ELSS mutual funds, life insurance premiums, NSC, 5-year tax-saving FDs, Sukanya Samriddhi, and home loan principal repayment.',
  },
  {
    q: 'Is Section 80C available in the New Regime?',
    a: 'No. Section 80C deductions do not apply under the New Regime. If your 80C investments are significant (close to ₹1,50,000), the Old Regime can save you meaningful tax.',
  },
  {
    q: 'Does home loan principal repayment count here?',
    a: 'Yes — but we\'ll capture it in the next steps. When you enter your home loan principal, it\'s automatically added to your 80C pool. You don\'t need to enter it here.',
  },
  {
    q: 'Is ELSS better than PPF for tax saving?',
    a: 'Both qualify for 80C. ELSS (equity mutual funds) has a 3-year lock-in with market-linked returns — historically higher but volatile. PPF has a 15-year lock-in with guaranteed ~7.1% returns. ELSS suits long-term risk-tolerant investors; PPF suits those wanting guaranteed returns.',
  },
  {
    q: 'What if I\'ve already invested more than ₹1,50,000?',
    a: 'Only ₹1,50,000 can be deducted regardless of how much you invest. Extra investments are still fine for financial goals, but won\'t provide additional tax savings under 80C. You might still get extra deductions via 80CCD(1B) for NPS.',
  },
]

const INVESTMENTS = [
  { key: 'elss',   label: 'ELSS / Tax-saving mutual funds' },
  { key: 'ppf',    label: 'PPF (Public Provident Fund)' },
  { key: 'nsc',    label: 'NSC (National Savings Certificate)' },
  { key: 'taxFD',  label: 'Tax-saving FD (5-year)' },
  { key: 'lic',    label: 'Life insurance premium (LIC etc.)' },
  { key: 'ssya',   label: 'Sukanya Samriddhi Yojana' },
  { key: 'other',  label: 'Other 80C investments' },
]

function initAmounts(investments80C) {
  return INVESTMENTS.reduce((acc, inv) => ({ ...acc, [inv.key]: 0 }), {})
}

export default function Step4({ onNext, onBack }) {
  const { state, update } = useTax()

  const [checked, setChecked] = useState(() =>
    INVESTMENTS.reduce((acc, inv) => ({ ...acc, [inv.key]: false }), {})
  )
  const [amounts, setAmounts] = useState(initAmounts)

  const toggleItem = (key) => {
    const next = { ...checked, [key]: !checked[key] }
    setChecked(next)
    if (!next[key]) {
      const nextAmounts = { ...amounts, [key]: 0 }
      setAmounts(nextAmounts)
      update({ investments80C: Object.values(nextAmounts).reduce((a, b) => a + b, 0) })
    }
  }

  const setAmount = (key, val) => {
    const nextAmounts = { ...amounts, [key]: val || 0 }
    setAmounts(nextAmounts)
    update({ investments80C: Object.values(nextAmounts).reduce((a, b) => a + b, 0) })
  }

  const investmentsTotal = Object.values(amounts).reduce((a, b) => a + b, 0)
  const pfAnnual = (state.pfDeductedMonthly || 0) * 12
  const combined = investmentsTotal + pfAnnual
  const effective = Math.min(combined, 150000)
  const atCap = combined >= 150000

  return (
    <div>
      <ProgressDots current={4} />

      <div className="mt-8">
        <h2 className="text-[28px] font-bold text-neutral-900 dark:text-white leading-tight">
          Did you make any 80C investments this year?
        </h2>
        <p className="mt-3 text-sm text-neutral-600 dark:text-gray-400 leading-relaxed">
          These reduce your taxable income under the Old Regime, up to ₹1,50,000 combined (including PF).
        </p>
      </div>

      <div className="mt-7 space-y-3">
        {INVESTMENTS.map(({ key, label }) => (
          <div key={key}>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggleItem(key)}
                className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors cursor-pointer ${
                  checked[key]
                    ? 'bg-primary border-primary'
                    : 'border-neutral-300 dark:border-gray-600 group-hover:border-primary bg-white dark:bg-gray-700'
                }`}
              >
                {checked[key] && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <span
                onClick={() => toggleItem(key)}
                className={`text-sm ${checked[key] ? 'font-semibold text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-gray-400'}`}
              >
                {label}
              </span>
            </label>
            {checked[key] && (
              <div className="ml-8 mt-2">
                <CurrencyInput
                  value={amounts[key] > 0 ? amounts[key] : null}
                  onChange={(v) => setAmount(key, v)}
                  placeholder="Annual amount"
                  autoFocus
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Running total */}
      {(investmentsTotal > 0 || pfAnnual > 0) && (
        <div className={`mt-6 rounded-xl px-4 py-4 text-sm space-y-1.5 ${atCap ? 'bg-warning/10 border border-warning/30' : 'bg-neutral-100 dark:bg-gray-700'}`}>
          {investmentsTotal > 0 && (
            <div className="flex justify-between text-neutral-600 dark:text-gray-400">
              <span>80C investments entered</span>
              <span className="tabular-nums font-medium">{formatINR(investmentsTotal)}</span>
            </div>
          )}
          {pfAnnual > 0 && (
            <div className="flex justify-between text-neutral-600 dark:text-gray-400">
              <span>PF contribution (annual)</span>
              <span className="tabular-nums font-medium">{formatINR(pfAnnual)}</span>
            </div>
          )}
          <div className="border-t border-neutral-300 dark:border-gray-600 pt-1.5 flex justify-between font-semibold text-neutral-900 dark:text-white">
            <span>Effective 80C deduction {atCap && <span className="text-warning">(capped)</span>}</span>
            <span className="tabular-nums">{formatINR(effective)}</span>
          </div>
          {atCap && (
            <p className="text-xs text-warning pt-0.5">
              Your 80C pool ({formatINR(combined)}) exceeds the ₹1,50,000 cap. Additional investments won't reduce your tax further.
            </p>
          )}
        </div>
      )}

      <StepNav onBack={onBack} onNext={onNext} />
      <FaqAccordion items={FAQS} />
    </div>
  )
}
