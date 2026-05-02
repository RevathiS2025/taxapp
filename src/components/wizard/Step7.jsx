import { useState } from 'react'
import { useTax } from '../../context/TaxContext'
import { formatINR, reconstructGross } from '../../engine/taxEngine'
import ProgressDots from '../ProgressDots'
import CurrencyInput from '../CurrencyInput'
import PillButton from '../PillButton'
import StepNav from '../StepNav'
import FaqAccordion from '../FaqAccordion'

const FAQS = [
  {
    q: 'What NPS tax benefit am I entitled to?',
    a: 'NPS has three tax angles: (1) 80CCD(1) — your own contribution within the ₹1,50,000 80C cap; (2) 80CCD(1B) — an extra ₹50,000 deduction beyond 80C, Old Regime only; (3) 80CCD(2) — employer contribution up to 14% of basic (New) or 10% (Old), available in both regimes.',
  },
  {
    q: 'Can I claim NPS deductions in the New Regime?',
    a: 'Partially. Employer NPS contributions (80CCD(2)) are deductible in both regimes up to 14% of basic salary. Your own additional contributions (80CCD(1B), ₹50,000) are only claimable in the Old Regime.',
  },
  {
    q: 'What is the maximum employer NPS deduction?',
    a: 'Under the New Regime, employer NPS is deductible up to 14% of your basic salary. Under the Old Regime, the cap is 10% of basic. Any excess is added back to your taxable income.',
  },
  {
    q: 'Should I open an NPS account just for tax saving?',
    a: 'It depends. If you\'re in the 30% tax bracket and haven\'t maxed 80C, the ₹50,000 80CCD(1B) deduction can save ₹5,000–₹7,800+/year. But NPS locks in your money until age 60, and 40% of the corpus must be used to buy an annuity at maturity — factor this in before investing.',
  },
  {
    q: 'What\'s the difference between employer and employee NPS contributions?',
    a: 'Employer NPS is when your company contributes to your NPS account (like PF) as part of your salary package. Employee NPS is when you voluntarily contribute from your own salary. Both provide tax benefits, but through different sections with different limits.',
  },
]

const NPS_OPTIONS = [
  { value: 'none',     label: 'None / not applicable' },
  { value: 'employer', label: 'Employer only' },
  { value: 'self',     label: 'I contribute only' },
  { value: 'both',     label: 'Both of us contribute' },
]

export default function Step7({ onNext, onBack }) {
  const { state, update } = useTax()

  const deriveOption = () => {
    const emp = state.npsEmployerMonthly > 0
    const self = state.npsEmployeeMonthly > 0
    if (emp && self) return 'both'
    if (emp) return 'employer'
    if (self) return 'self'
    if (state.npsEmployerMonthly === 0 || state.npsEmployeeMonthly === 0) return 'none'
    return null
  }

  const [npsOption, setNpsOption] = useState(deriveOption)

  const handleOption = (val) => {
    setNpsOption(val)
    if (val === 'none') {
      update({ npsEmployerMonthly: 0, npsEmployeeMonthly: 0 })
    } else if (val === 'employer') {
      update({ npsEmployeeMonthly: 0 })
    } else if (val === 'self') {
      update({ npsEmployerMonthly: 0 })
    }
  }

  const showEmployer = npsOption === 'employer' || npsOption === 'both'
  const showSelf     = npsOption === 'self'     || npsOption === 'both'

  // Employer NPS cap warning: 14% of estimated basic monthly
  const { basicSalary } = reconstructGross(state)
  const basicMonthly = basicSalary / 12
  const maxEmployerMonthly = Math.round(basicMonthly * 0.14)
  const employerExceedsCap = state.npsEmployerMonthly > maxEmployerMonthly && maxEmployerMonthly > 0

  // Employee NPS cap: ₹50,000/year = ₹4,167/month
  const employeeExceedsCap = (state.npsEmployeeMonthly || 0) * 12 > 50000

  const isValid = npsOption !== null

  return (
    <div>
      <ProgressDots current={7} />

      <div className="mt-8">
        <h2 className="text-[28px] font-bold text-neutral-900 leading-tight">
          Does anyone contribute to NPS on your behalf?
        </h2>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
          NPS contributions get special deductions in both regimes — employer contributions via 80CCD(2) are available in both; employee contributions via 80CCD(1B) only in the Old Regime.
        </p>
      </div>

      <div className="mt-7 flex gap-3 flex-wrap">
        {NPS_OPTIONS.map(({ value, label }) => (
          <PillButton key={value} active={npsOption === value} onClick={() => handleOption(value)}>
            {label}
          </PillButton>
        ))}
      </div>

      <div className="mt-7 space-y-6">
        {showEmployer && (
          <div>
            <label htmlFor="nps-employer" className="block text-sm font-semibold text-neutral-900 mb-1">
              Employer's monthly NPS contribution
            </label>
            <p className="text-xs text-neutral-500 mb-2">
              80CCD(2): deductible in both regimes — up to 14% of basic (New) or 10% of basic (Old)
            </p>
            <CurrencyInput
              id="nps-employer"
              value={state.npsEmployerMonthly > 0 ? state.npsEmployerMonthly : null}
              onChange={(v) => update({ npsEmployerMonthly: v })}
              placeholder="e.g., 2,000"
              autoFocus
            />
            {employerExceedsCap && (
              <p className="mt-2 text-xs text-warning">
                Based on your salary, the effective cap for new regime is approx. {formatINR(maxEmployerMonthly)}/month. Any excess won't be deductible.
              </p>
            )}
          </div>
        )}

        {showSelf && (
          <div>
            <label htmlFor="nps-self" className="block text-sm font-semibold text-neutral-900 mb-1">
              Your monthly NPS contribution
            </label>
            <p className="text-xs text-neutral-500 mb-2">
              80CCD(1B): up to ₹50,000/year extra deduction — Old Regime only
            </p>
            <CurrencyInput
              id="nps-self"
              value={state.npsEmployeeMonthly > 0 ? state.npsEmployeeMonthly : null}
              onChange={(v) => update({ npsEmployeeMonthly: v })}
              placeholder="e.g., 2,000"
              autoFocus={!showEmployer}
            />
            {employeeExceedsCap && (
              <p className="mt-2 text-xs text-warning">
                Only ₹50,000/year (≈ ₹4,167/month) is deductible under 80CCD(1B). The excess won't be claimed.
              </p>
            )}
          </div>
        )}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
      <FaqAccordion items={FAQS} />
    </div>
  )
}
