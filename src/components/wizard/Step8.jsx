import { useState } from 'react'
import { useTax } from '../../context/TaxContext'
import ProgressDots from '../ProgressDots'
import CurrencyInput from '../CurrencyInput'
import PillButton from '../PillButton'
import StepNav from '../StepNav'
import FaqAccordion from '../FaqAccordion'

const FAQS = [
  {
    q: 'Which interest income qualifies for 80TTA or 80TTB?',
    a: '80TTA (below 60): deduction up to ₹10,000 on savings bank account interest only — FD interest does not qualify. 80TTB (senior citizens 60+): deduction up to ₹50,000 on all interest income including FDs, savings accounts, and post office deposits.',
  },
  {
    q: 'Is FD interest also covered under 80TTA?',
    a: 'No. Section 80TTA only covers savings bank account interest for non-senior citizens. FD interest is fully taxable for people below 60 (after the ₹10,000 savings account deduction). Senior citizens can claim FD interest under 80TTB.',
  },
  {
    q: 'What is professional tax and do I pay it?',
    a: 'Professional tax is levied by state governments on salaried employees. Most states cap it at ₹2,400/year (₹200/month). It\'s deductible from gross salary in both Old and New Regimes. Not all states levy it — Delhi, UP, Haryana, and Rajasthan are notable exceptions.',
  },
  {
    q: 'My state doesn\'t levy professional tax — what should I enter?',
    a: 'Click "Edit" and set it to ₹0. Entering the correct value matters because professional tax is deducted before computing taxable income in both regimes.',
  },
  {
    q: 'Should I report savings interest income even if it\'s small?',
    a: 'Yes. Banks report interest to the Income Tax Department via Form 26AS and AIS. For our calculator, entering the interest helps determine whether 80TTA/TTB applies. Amounts above ₹10,000 (savings) are taxable and should be declared in your ITR.',
  },
]

export default function Step8({ onNext, onBack }) {
  const { state, update } = useTax()

  const [hasSavingsInterest, setHasSavingsInterest] = useState(
    state.savingsInterest === 0 ? false
    : state.savingsInterest != null && state.savingsInterest > 0 ? true
    : null
  )
  const [editingProfTax, setEditingProfTax] = useState(false)

  const handleHasSavingsInterest = (has) => {
    setHasSavingsInterest(has)
    if (!has) {
      update({ savingsInterest: 0 })
    } else if (state.savingsInterest === 0) {
      update({ savingsInterest: null })
    }
  }

  const profTax = state.professionalTax ?? 2400

  return (
    <div>
      <ProgressDots current={8} />

      <div className="mt-8">
        <h2 className="text-[28px] font-bold text-neutral-900 leading-tight">
          Any other income or deductions?
        </h2>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
          A few more details to make your comparison accurate.
        </p>
      </div>

      {/* Savings interest */}
      <div className="mt-8">
        <p className="text-sm font-semibold text-neutral-900 mb-1">
          Do you earn interest from savings accounts or FDs?
        </p>
        <p className="text-xs text-neutral-500 mb-3">
          Under the Old Regime, up to ₹10,000 is deductible (₹50,000 for senior citizens via 80TTB).
        </p>
        <div className="flex gap-3 flex-wrap">
          <PillButton active={hasSavingsInterest === true} onClick={() => handleHasSavingsInterest(true)}>
            Yes
          </PillButton>
          <PillButton active={hasSavingsInterest === false} onClick={() => handleHasSavingsInterest(false)}>
            No
          </PillButton>
        </div>
        {hasSavingsInterest === true && (
          <div className="mt-4">
            <label htmlFor="savings-interest" className="block text-sm font-semibold text-neutral-900 mb-2">
              Annual savings / FD interest income
            </label>
            <CurrencyInput
              id="savings-interest"
              value={state.savingsInterest > 0 ? state.savingsInterest : null}
              onChange={(v) => update({ savingsInterest: v })}
              placeholder="e.g., 8,000"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Professional tax */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-neutral-900">Professional tax</p>
          {!editingProfTax && (
            <button
              type="button"
              onClick={() => setEditingProfTax(true)}
              className="text-xs text-primary font-medium hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        <p className="text-xs text-neutral-500 mb-3">
          Most salaried employees pay ₹2,400/year (₹200/month). Only change if your state is different.
        </p>
        {editingProfTax ? (
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <CurrencyInput
                id="prof-tax"
                value={profTax}
                onChange={(v) => update({ professionalTax: v || 0 })}
                placeholder="2,400"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => setEditingProfTax(false)}
              className="mt-0.5 text-xs text-neutral-600 font-medium hover:text-neutral-900 border border-neutral-300 rounded-lg px-3 py-2.5"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 rounded-xl border border-neutral-200 w-fit">
            <span className="text-sm font-semibold text-neutral-900">₹{profTax.toLocaleString('en-IN')}</span>
            <span className="text-xs text-neutral-500">/ year</span>
          </div>
        )}
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
      <FaqAccordion items={FAQS} />
    </div>
  )
}
