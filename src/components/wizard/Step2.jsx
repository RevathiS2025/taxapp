import { useState } from 'react'
import { useTax } from '../../context/TaxContext'
import ProgressDots from '../ProgressDots'
import CurrencyInput from '../CurrencyInput'
import PillButton from '../PillButton'
import StepNav from '../StepNav'
import FaqAccordion from '../FaqAccordion'

const FAQS = [
  {
    q: 'What is HRA and how is the exemption calculated?',
    a: 'HRA (House Rent Allowance) is a salary component paid towards rent. The tax exemption is the minimum of: (1) actual HRA received, (2) rent paid minus 10% of basic salary, and (3) 50% of basic for metro / 40% for non-metro cities. We estimate your HRA based on your declared salary.',
  },
  {
    q: 'Which cities count as "metro" for HRA?',
    a: 'For HRA purposes, only four cities qualify as metro: Mumbai, Delhi, Kolkata, and Chennai. All others — including Bengaluru, Hyderabad, Pune, and Ahmedabad — are non-metro and get a 40% cap instead of 50%.',
  },
  {
    q: 'What if my employer doesn\'t give HRA in my salary structure?',
    a: 'Without HRA as a salary component, you cannot claim the standard HRA exemption. You may qualify for Section 80GG (if you don\'t own a house and pay rent), but that has a lower ₹60,000/year cap and different conditions. This calculator covers the standard HRA exemption.',
  },
  {
    q: 'Is HRA exemption available in the New Regime?',
    a: 'No. HRA exemption is only available under the Old Regime. The New Regime taxes the full salary without allowance exemptions. This is often why people paying high rent prefer the Old Regime.',
  },
  {
    q: 'Can I claim HRA if I pay rent to a parent?',
    a: 'Yes, with conditions. You need a formal rent agreement and your parent must declare the rental income in their ITR. You cannot claim HRA for rent paid to your spouse.',
  },
]

export default function Step2({ onNext, onBack }) {
  const { state, update } = useTax()

  const [paysRent, setPaysRent] = useState(
    state.monthlyRent === 0 ? false
    : state.monthlyRent != null && state.monthlyRent > 0 ? true
    : null
  )

  const handlePaysRent = (pays) => {
    setPaysRent(pays)
    if (!pays) {
      update({ monthlyRent: 0, city: null })
    } else if (state.monthlyRent === 0) {
      update({ monthlyRent: null })
    }
  }

  const isValid =
    paysRent === false ||
    (paysRent === true && state.monthlyRent > 0 && state.city != null)

  return (
    <div>
      <ProgressDots current={2} />

      <div className="mt-8">
        <h2 className="text-[28px] font-bold text-neutral-900 leading-tight">
          Do you pay rent?
        </h2>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
          If you receive HRA from your employer, entering your rent can reduce taxable income under the Old Regime.
        </p>
      </div>

      <div className="mt-7 flex gap-3 flex-wrap">
        <PillButton active={paysRent === true} onClick={() => handlePaysRent(true)}>
          Yes, I pay rent
        </PillButton>
        <PillButton active={paysRent === false} onClick={() => handlePaysRent(false)}>
          No, I own / live rent-free
        </PillButton>
      </div>

      {paysRent === true && (
        <div className="mt-7 space-y-6">
          <div>
            <label htmlFor="monthly-rent" className="block text-sm font-semibold text-neutral-900 mb-2">
              Monthly rent
            </label>
            <CurrencyInput
              id="monthly-rent"
              value={state.monthlyRent > 0 ? state.monthlyRent : null}
              onChange={(v) => update({ monthlyRent: v })}
              placeholder="e.g., 20,000"
              autoFocus
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-900 mb-3">Which city do you live in?</p>
            <div className="flex gap-3 flex-wrap">
              <PillButton active={state.city === 'metro'} onClick={() => update({ city: 'metro' })}>
                Metro city
              </PillButton>
              <PillButton active={state.city === 'non-metro'} onClick={() => update({ city: 'non-metro' })}>
                Other city
              </PillButton>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Metro: Mumbai, Delhi, Kolkata, Chennai
            </p>
          </div>
        </div>
      )}

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
      <FaqAccordion items={FAQS} />
    </div>
  )
}
