import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Step1 from '../components/wizard/Step1'
import Step2 from '../components/wizard/Step2'
import Step3 from '../components/wizard/Step3'
import Step4 from '../components/wizard/Step4'
import Step5 from '../components/wizard/Step5'
import Step6 from '../components/wizard/Step6'
import Step7 from '../components/wizard/Step7'
import Step8 from '../components/wizard/Step8'
import Step9 from '../components/wizard/Step9'
import LivePreview from '../components/LivePreview'
import MobileEstimateSheet from '../components/MobileEstimateSheet'

const TOTAL_STEPS = 9

export default function CalculatorPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)

  // Scroll to top and announce step change to screen readers
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(s => s + 1)
    } else {
      navigate('/results')
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2" aria-label="TaxCompare home">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white text-xs font-bold">₹</span>
            </div>
            <span className="font-semibold text-neutral-900 text-sm">TaxCompare</span>
          </Link>
          <span className="text-neutral-600 text-xs bg-white border border-neutral-300 rounded-full px-3 py-1">
            FY 2025-26
          </span>
        </div>

        {/* Two-column layout: wizard left, preview right */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Wizard column — pb-20 on mobile leaves room above the bottom bar */}
          <div className="w-full lg:flex-1 lg:max-w-[640px] pb-20 lg:pb-0">
            <main>
              <div className="bg-white rounded-2xl border border-neutral-300 shadow-panel p-8">
                {currentStep === 1 && <Step1 onNext={handleNext} onBack={handleBack} />}
                {currentStep === 2 && <Step2 onNext={handleNext} onBack={handleBack} />}
                {currentStep === 3 && <Step3 onNext={handleNext} onBack={handleBack} />}
                {currentStep === 4 && <Step4 onNext={handleNext} onBack={handleBack} />}
                {currentStep === 5 && <Step5 onNext={handleNext} onBack={handleBack} />}
                {currentStep === 6 && <Step6 onNext={handleNext} onBack={handleBack} />}
                {currentStep === 7 && <Step7 onNext={handleNext} onBack={handleBack} />}
                {currentStep === 8 && <Step8 onNext={handleNext} onBack={handleBack} />}
                {currentStep === 9 && <Step9 onNext={handleNext} onBack={handleBack} />}
              </div>
            </main>
          </div>

          {/* Live preview — desktop sidebar only, hidden on mobile */}
          <div className="hidden lg:block lg:w-[360px] lg:flex-none">
            <div className="lg:sticky lg:top-6">
              <LivePreview />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: sticky bottom bar + sheet drawer */}
      <MobileEstimateSheet />
    </div>
  )
}
