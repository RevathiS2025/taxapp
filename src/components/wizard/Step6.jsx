import { useState } from 'react'
import { useTax } from '../../context/TaxContext'
import ProgressDots from '../ProgressDots'
import CurrencyInput from '../CurrencyInput'
import PillButton from '../PillButton'
import StepNav from '../StepNav'
import FaqAccordion from '../FaqAccordion'

const FAQS = [
  {
    q: 'What home loan deductions can I claim?',
    a: 'Under the Old Regime: interest paid is deductible up to ₹2,00,000/year for a self-occupied property (Section 24b), and principal repayment counts within your 80C limit (Section 80C). Neither applies in the New Regime for self-occupied property.',
  },
  {
    q: 'Is the ₹2 lakh interest cap per person or per property?',
    a: 'Per person, per year. If you co-own with your spouse, each of you can claim up to ₹2,00,000 on your respective tax returns — ₹4,00,000 combined for the same loan.',
  },
  {
    q: 'Can I claim both HRA and home loan deductions?',
    a: 'Yes. You can claim HRA exemption and home loan interest deduction simultaneously — for example, if your owned property is in another city or is under construction while you rent where you work.',
  },
  {
    q: 'Does home loan interest deduction apply in the New Regime?',
    a: 'No. Section 24(b) interest deduction is not available in the New Regime for self-occupied property. This is a key reason people with large home loans often prefer the Old Regime.',
  },
  {
    q: 'What about a home loan for a let-out (rented-out) property?',
    a: 'For a let-out property, the full interest is deductible with no cap under the Old Regime (rental income must also be declared). This calculator covers self-occupied property — the ₹2 lakh limit applies.',
  },
]

export default function Step6({ onNext, onBack }) {
  const { state, update } = useTax()

  const [hasHomeLoan, setHasHomeLoan] = useState(
    state.homeLoanInterest === 0 ? false
    : state.homeLoanInterest != null && state.homeLoanInterest > 0 ? true
    : null
  )

  const handleHasHomeLoan = (has) => {
    setHasHomeLoan(has)
    if (!has) {
      update({ homeLoanInterest: 0, homeLoanPrincipal: 0 })
    } else if (state.homeLoanInterest === 0) {
      update({ homeLoanInterest: null, homeLoanPrincipal: null })
    }
  }

  const interestCapped = state.homeLoanInterest > 200000
  const isValid = hasHomeLoan === false || (hasHomeLoan === true && state.homeLoanInterest > 0)

  return (
    <div>
      <ProgressDots current={6} />

      <div className="mt-8">
        <h2 className="text-[28px] font-bold text-neutral-900 leading-tight">
          Do you have a home loan?
        </h2>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
          Under the Old Regime, home loan interest (Section 24b) gives up to ₹2,00,000 deduction, and principal repayment goes into your ₹1,50,000 80C pool.
        </p>
      </div>

      <div className="mt-7 flex gap-3 flex-wrap">
        <PillButton active={hasHomeLoan === true} onClick={() => handleHasHomeLoan(true)}>
          Yes, I have a home loan
        </PillButton>
        <PillButton active={hasHomeLoan === false} onClick={() => handleHasHomeLoan(false)}>
          No
        </PillButton>
      </div>

      {hasHomeLoan === true && (
        <div className="mt-7 space-y-6">
          <div>
            <label htmlFor="loan-interest" className="block text-sm font-semibold text-neutral-900 mb-1">
              Annual home loan interest paid
            </label>
            <p className="text-xs text-neutral-500 mb-2">
              Section 24(b) — deductible up to ₹2,00,000 for self-occupied property
            </p>
            <CurrencyInput
              id="loan-interest"
              value={state.homeLoanInterest > 0 ? state.homeLoanInterest : null}
              onChange={(v) => update({ homeLoanInterest: v })}
              placeholder="e.g., 1,50,000"
              autoFocus
            />
            {interestCapped && (
              <p className="mt-2 text-xs text-warning">
                Only ₹2,00,000 will be claimed as deduction (self-occupied limit).
              </p>
            )}
          </div>

          <div>
            <label htmlFor="loan-principal" className="block text-sm font-semibold text-neutral-900 mb-1">
              Annual principal repayment
            </label>
            <p className="text-xs text-neutral-500 mb-2">
              Goes into your 80C pool (combined with PF and investments, capped at ₹1,50,000)
            </p>
            <CurrencyInput
              id="loan-principal"
              value={state.homeLoanPrincipal > 0 ? state.homeLoanPrincipal : null}
              onChange={(v) => update({ homeLoanPrincipal: v })}
              placeholder="e.g., 80,000"
            />
          </div>
        </div>
      )}

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
      <FaqAccordion items={FAQS} />
    </div>
  )
}
