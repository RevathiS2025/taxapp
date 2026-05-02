import { useState } from 'react'
import { useTax } from '../../context/TaxContext'
import ProgressDots from '../ProgressDots'
import CurrencyInput from '../CurrencyInput'
import StepNav from '../StepNav'
import FaqAccordion from '../FaqAccordion'

const FAQS = [
  {
    q: 'What does "take-home" mean vs CTC?',
    a: 'Take-home (net salary) is what gets credited to your bank account after all deductions — PF, TDS, professional tax, etc. CTC (Cost to Company) is much higher and includes employer costs like employer PF, gratuity, and non-cash perks. Always use your actual monthly bank credit.',
  },
  {
    q: 'Should I include variable pay or bonuses?',
    a: 'Enter your regular monthly take-home for now. Variable pay and bonuses are irregular, so using just your fixed monthly amount gives the most stable comparison. If you want to include bonuses, add them to your monthly figure as an average (e.g., ₹60,000 bonus ÷ 12 = ₹5,000/month extra).',
  },
  {
    q: 'My salary varies month to month — what should I enter?',
    a: "Enter the amount on a typical month's pay slip. If it genuinely varies a lot, use your most recent month's net figure. The calculator will extrapolate this to an annual figure, so a representative month matters most.",
  },
  {
    q: 'Is this calculator for FY 2025-26?',
    a: 'Yes. All calculations use FY 2025-26 (AY 2026-27) tax slabs, including the revised New Regime slabs and the increased ₹12,00,000 rebate threshold announced in Union Budget 2025.',
  },
  {
    q: 'I\'m self-employed — can I use this?',
    a: 'This tool is designed for salaried employees. Self-employed individuals have different rules around business expenses, presumptive taxation, and GST. The results will be approximate and won\'t capture your full picture — but can still give a rough directional comparison.',
  },
]

export default function Step1({ onNext, onBack }) {
  const { state, update } = useTax()
  const [touched, setTouched] = useState(false)

  const value = state.monthlyTakeHome
  const isValid = value != null && value > 0

  const warning =
    touched && value != null && value < 10000
      ? 'That seems low. Are you sure this is your monthly take-home?'
      : touched && value != null && value > 1000000
        ? "That's above ₹1 crore/year. Our calculator is designed for salaries up to ₹1 crore/year. Results may be approximate."
        : null

  return (
    <div>
      <ProgressDots current={1} />

      <div className="mt-8">
        <h2 className="text-[28px] font-bold text-neutral-900 leading-tight">
          How much do you receive in your bank account every month?
        </h2>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
          This is your in-hand salary — after your company deducts PF, TDS, professional tax, and any other deductions.
        </p>
      </div>

      <div className="mt-7">
        <label htmlFor="monthly-takehome" className="block text-sm font-semibold text-neutral-900 mb-2">
          Monthly take-home salary
        </label>
        <CurrencyInput
          id="monthly-takehome"
          value={value}
          onChange={(v) => {
            setTouched(true)
            update({ monthlyTakeHome: v })
          }}
          placeholder="e.g., 65,000"
          autoFocus
        />
        {warning && (
          <p className="mt-2 text-sm text-warning flex items-start gap-1.5">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            {warning}
          </p>
        )}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
      <FaqAccordion items={FAQS} />
    </div>
  )
}
