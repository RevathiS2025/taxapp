import { useState } from 'react'
import { useTax } from '../../context/TaxContext'
import ProgressDots from '../ProgressDots'
import CurrencyInput from '../CurrencyInput'
import PillButton from '../PillButton'
import StepNav from '../StepNav'
import FaqAccordion from '../FaqAccordion'

const FAQS = [
  {
    q: 'What is Section 80D and how much can I claim?',
    a: 'Section 80D lets you deduct health insurance premiums under the Old Regime: up to ₹25,000 for self + spouse + children, plus up to ₹25,000 (or ₹50,000 if parents are senior citizens) for parents\' insurance. Total maximum: ₹75,000/year if parents are senior citizens.',
  },
  {
    q: 'Is Section 80D available in the New Regime?',
    a: 'No. The 80D health insurance deduction is only available under the Old Regime. If you pay significant premiums, this can be a strong reason to stick with the Old Regime.',
  },
  {
    q: 'Does my employer\'s group health insurance count for 80D?',
    a: 'No. Only premiums you personally pay out-of-pocket for an individual or family floater policy qualify. Group insurance premiums paid by your employer on your behalf don\'t give you a personal 80D deduction.',
  },
  {
    q: 'Are preventive health checkups covered under 80D?',
    a: 'Yes — up to ₹5,000 for preventive health checkups qualifies within the overall ₹25,000 limit. This amount can be paid in cash (unlike insurance premiums which require non-cash payment to qualify).',
  },
  {
    q: 'My parents are under 60 — how much can I claim for their insurance?',
    a: 'If your parents are below 60, the deduction for their premium is capped at ₹25,000 (same as self). The higher ₹50,000 limit applies only when parents are 60 or older. The total for self + parents would be ₹25,000 + ₹25,000 = ₹50,000 in this case.',
  },
]

export default function Step5({ onNext, onBack }) {
  const { state, update } = useTax()

  const [hasInsurance, setHasInsurance] = useState(
    state.healthInsuranceSelf === 0 ? false
    : state.healthInsuranceSelf != null && state.healthInsuranceSelf > 0 ? true
    : null
  )
  const [coversParents, setCoversParents] = useState(
    state.healthInsuranceParents === 0 ? false
    : state.healthInsuranceParents != null && state.healthInsuranceParents > 0 ? true
    : null
  )

  const handleHasInsurance = (has) => {
    setHasInsurance(has)
    if (!has) {
      update({ healthInsuranceSelf: 0, healthInsuranceParents: 0, parentsAreSenior: false })
      setCoversParents(null)
    } else if (state.healthInsuranceSelf === 0) {
      update({ healthInsuranceSelf: null })
    }
  }

  const handleCoversParents = (covers) => {
    setCoversParents(covers)
    if (!covers) {
      update({ healthInsuranceParents: 0, parentsAreSenior: false })
    } else if (state.healthInsuranceParents === 0) {
      update({ healthInsuranceParents: null })
    }
  }

  const isValid =
    hasInsurance === false ||
    (hasInsurance === true && state.healthInsuranceSelf > 0)

  return (
    <div>
      <ProgressDots current={5} />

      <div className="mt-8">
        <h2 className="text-[28px] font-bold text-neutral-900 leading-tight">
          Do you pay health insurance premiums?
        </h2>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
          Health insurance premiums qualify for an 80D deduction under the Old Regime — up to ₹25,000 for self, and up to ₹50,000 for senior parents.
        </p>
      </div>

      <div className="mt-7 flex gap-3 flex-wrap">
        <PillButton active={hasInsurance === true} onClick={() => handleHasInsurance(true)}>
          Yes
        </PillButton>
        <PillButton active={hasInsurance === false} onClick={() => handleHasInsurance(false)}>
          No
        </PillButton>
      </div>

      {hasInsurance === true && (
        <div className="mt-7 space-y-6">
          <div>
            <label htmlFor="insurance-self" className="block text-sm font-semibold text-neutral-900 mb-1">
              Annual premium for self, spouse &amp; children
            </label>
            <p className="text-xs text-neutral-500 mb-2">Deductible up to ₹25,000 per year</p>
            <CurrencyInput
              id="insurance-self"
              value={state.healthInsuranceSelf > 0 ? state.healthInsuranceSelf : null}
              onChange={(v) => update({ healthInsuranceSelf: v })}
              placeholder="e.g., 15,000"
              autoFocus
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-900 mb-3">
              Do you also pay for your parents' health insurance?
            </p>
            <div className="flex gap-3 flex-wrap">
              <PillButton active={coversParents === true} onClick={() => handleCoversParents(true)}>
                Yes
              </PillButton>
              <PillButton active={coversParents === false} onClick={() => handleCoversParents(false)}>
                No
              </PillButton>
            </div>
          </div>

          {coversParents === true && (
            <div className="space-y-4">
              <div>
                <label htmlFor="insurance-parents" className="block text-sm font-semibold text-neutral-900 mb-1">
                  Annual premium for parents
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  Deductible up to ₹25,000 (₹50,000 if parents are senior citizens)
                </p>
                <CurrencyInput
                  id="insurance-parents"
                  value={state.healthInsuranceParents > 0 ? state.healthInsuranceParents : null}
                  onChange={(v) => update({ healthInsuranceParents: v })}
                  placeholder="e.g., 20,000"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-900 mb-3">
                  Are your parents senior citizens (60+)?
                </p>
                <div className="flex gap-3 flex-wrap">
                  <PillButton
                    active={state.parentsAreSenior === true}
                    onClick={() => update({ parentsAreSenior: true })}
                  >
                    Yes
                  </PillButton>
                  <PillButton
                    active={state.parentsAreSenior === false}
                    onClick={() => update({ parentsAreSenior: false })}
                  >
                    No
                  </PillButton>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!isValid} />
      <FaqAccordion items={FAQS} />
    </div>
  )
}
