import { useTax } from '../../context/TaxContext'
import ProgressDots from '../ProgressDots'
import StepNav from '../StepNav'
import FaqAccordion from '../FaqAccordion'

const FAQS = [
  {
    q: 'Why does my age affect my taxes?',
    a: 'Age determines your basic exemption limit under the Old Regime: below 60 → ₹2,50,000 exempt; senior citizens (60–79) → ₹3,00,000; super seniors (80+) → ₹5,00,000. A higher exemption shifts more income into the zero-tax band.',
  },
  {
    q: 'Does age affect the New Regime slabs?',
    a: 'No. Under the New Regime, the basic exemption is ₹3,00,000 for everyone regardless of age. The 87A rebate (making income up to ₹12,00,000 effectively tax-free) also applies equally across all age groups.',
  },
  {
    q: 'I turn 60 this financial year — which category applies?',
    a: 'If your 60th birthday falls during FY 2025-26 (1 Apr 2025 – 31 Mar 2026), you qualify as a Senior Citizen for the entire year. Select "Senior citizen (60–79)" if your birthday is in this period.',
  },
  {
    q: 'What is Section 80TTB for senior citizens?',
    a: 'Section 80TTB lets senior citizens (60+) deduct up to ₹50,000/year on interest from bank deposits (savings, FDs), post office deposits, and co-operative bank deposits. This replaces the ₹10,000 80TTA deduction available to non-seniors.',
  },
  {
    q: 'Are super senior citizens taxed differently in any other ways?',
    a: 'Yes. Super seniors (80+) are exempt from paying advance tax — they can pay all tax at ITR filing time. They\'re also exempt from filing ITR-1 if they receive pension from a bank. These don\'t change the slab calculation but affect filing procedures.',
  },
]

const AGE_OPTIONS = [
  {
    value: 'below60',
    label: 'Below 60',
    description: 'Standard tax slabs apply. Basic exemption is ₹2,50,000 under the Old Regime.',
  },
  {
    value: 'senior',
    label: 'Senior citizen (60–79)',
    description: 'Higher basic exemption of ₹3,00,000 under the Old Regime. Also eligible for the full ₹50,000 80TTB deduction on interest income.',
  },
  {
    value: 'supersenior',
    label: 'Super senior (80+)',
    description: 'Highest basic exemption of ₹5,00,000 under the Old Regime. Same 80TTB interest deduction benefit.',
  },
]

export default function Step9({ onNext, onBack }) {
  const { state, update } = useTax()
  const selected = state.age || 'below60'

  return (
    <div>
      <ProgressDots current={9} />

      <div className="mt-8">
        <h2 className="text-[28px] font-bold text-neutral-900 dark:text-white leading-tight">
          What is your age group?
        </h2>
        <p className="mt-3 text-sm text-neutral-600 dark:text-gray-400 leading-relaxed">
          Age determines your tax slab thresholds under the Old Regime.
        </p>
      </div>

      <div className="mt-7 space-y-3">
        {AGE_OPTIONS.map(({ value, label, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => update({ age: value })}
            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-colors ${
              selected === value
                ? 'border-primary bg-primary-light dark:bg-primary/10'
                : 'border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-primary/50'
            }`}
          >
            <p className={`text-sm font-semibold ${selected === value ? 'text-primary' : 'text-neutral-900 dark:text-white'}`}>
              {label}
            </p>
            <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
          </button>
        ))}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="See My Results" />
      <FaqAccordion items={FAQS} />
    </div>
  )
}
