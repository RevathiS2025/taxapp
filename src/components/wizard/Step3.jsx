import { useState } from 'react'
import { useTax } from '../../context/TaxContext'
import { formatINR } from '../../engine/taxEngine'
import ProgressDots from '../ProgressDots'
import CurrencyInput from '../CurrencyInput'
import PillButton from '../PillButton'
import StepNav from '../StepNav'
import FaqAccordion from '../FaqAccordion'

const FAQS = [
  {
    q: 'How does my PF contribution reduce taxes?',
    a: 'Your employee PF contribution (typically 12% of basic) qualifies as an 80C deduction under the Old Regime, up to the ₹1,50,000 combined limit. So ₹1,800/month PF = ₹21,600/year knocked off your taxable income.',
  },
  {
    q: 'How do I find my monthly PF deduction?',
    a: 'Check your pay slip — it\'s listed as "EPF" or "PF" in the deductions column. It\'s typically 12% of your basic salary. You can also verify via your EPFO member passbook (passbook.epfindia.gov.in) or Form 12BB.',
  },
  {
    q: 'What if my company doesn\'t deduct PF?',
    a: 'Companies with fewer than 20 employees are exempt from EPF. Employees earning above the ₹15,000 wage threshold can also opt out in some cases. If PF isn\'t deducted, select "No" — it doesn\'t affect the New Regime calculation at all.',
  },
  {
    q: 'Does my employer\'s matching PF contribution also save tax?',
    a: 'Employer PF is not taxable up to 12% of basic salary (subject to an overall ₹7.5 lakh employer contribution cap across PF, NPS, and superannuation). It doesn\'t add to your 80C deduction, but it builds your retirement corpus tax-free.',
  },
  {
    q: 'Can I contribute more than 12% voluntarily?',
    a: 'Yes — this is called VPF (Voluntary Provident Fund). Additional VPF contributions beyond the mandatory 12% also qualify for 80C. The combined limit across PF + VPF + other 80C investments remains ₹1,50,000/year.',
  },
]

export default function Step3({ onNext, onBack }) {
  const { state, update } = useTax()

  const [hasPF, setHasPF] = useState(
    state.pfDeductedMonthly === 0 ? false
    : state.pfDeductedMonthly != null && state.pfDeductedMonthly > 0 ? true
    : null
  )

  const handleHasPF = (has) => {
    setHasPF(has)
    if (!has) {
      update({ pfDeductedMonthly: 0, epfMonthlyEmployer: 0 })
    } else if (state.pfDeductedMonthly === 0) {
      update({ pfDeductedMonthly: null })
    }
  }

  const estimatedMonthlyPF = state.monthlyTakeHome
    ? Math.round(state.monthlyTakeHome * 0.4 * 0.12)
    : null

  const isValid = hasPF === false || (hasPF === true && state.pfDeductedMonthly > 0)

  return (
    <div>
      <ProgressDots current={3} />

      <div className="mt-8">
        <h2 className="text-[28px] font-bold text-neutral-900 dark:text-white leading-tight">
          Does your employer deduct Provident Fund (PF)?
        </h2>
        <p className="mt-3 text-sm text-neutral-600 dark:text-gray-400 leading-relaxed">
          Employee PF contributions count towards your ₹1,50,000 80C limit, reducing Old Regime tax.
        </p>
      </div>

      <div className="mt-7 flex gap-3 flex-wrap">
        <PillButton active={hasPF === true} onClick={() => handleHasPF(true)}>
          Yes, PF is deducted
        </PillButton>
        <PillButton active={hasPF === false} onClick={() => handleHasPF(false)}>
          No / not applicable
        </PillButton>
      </div>

      {hasPF === true && (
        <div className="mt-7">
          <label htmlFor="monthly-pf" className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
            Monthly employee PF deduction
          </label>
          <CurrencyInput
            id="monthly-pf"
            value={state.pfDeductedMonthly > 0 ? state.pfDeductedMonthly : null}
            onChange={(v) => update({ pfDeductedMonthly: v })}
            placeholder="e.g., 1,800"
            autoFocus
          />
          {estimatedMonthlyPF && (
            <p className="mt-2 text-xs text-neutral-500 dark:text-gray-500">
              Not sure? PF is typically 12% of your basic salary — roughly{' '}
              <span className="font-medium text-neutral-700 dark:text-gray-300">{formatINR(estimatedMonthlyPF)} / month</span> for
              your salary.
            </p>
          )}
        </div>
      )}

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
      <FaqAccordion items={FAQS} />
    </div>
  )
}
