import { useId, useState } from 'react'

export default function FaqAccordion({ items }) {
  const uid = useId()
  const [sectionOpen, setSectionOpen] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)
  const sectionId = `faq-section-${uid}`

  return (
    <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-gray-700">
      <button
        type="button"
        aria-expanded={sectionOpen}
        aria-controls={sectionId}
        onClick={() => setSectionOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-gray-500 hover:text-neutral-700 dark:hover:text-gray-300 transition-colors"
      >
        <svg
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${sectionOpen ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span>Common questions about this step</span>
      </button>

      <div
        id={sectionId}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          sectionOpen ? 'max-h-[700px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-2">
          {items.map((item, i) => {
            const answerId = `${uid}-answer-${i}`
            const isOpen = openIndex === i
            return (
              <div key={i} className="border border-neutral-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-neutral-800 dark:text-gray-200 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="pr-2">{item.q}</span>
                  <svg
                    className={`w-4 h-4 flex-shrink-0 text-neutral-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div
                  id={answerId}
                  role="region"
                  aria-label={item.q}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48' : 'max-h-0'}`}
                >
                  <p className="px-4 pb-4 pt-2 text-sm text-neutral-600 dark:text-gray-400 leading-relaxed border-t border-neutral-100 dark:border-gray-700">
                    {item.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
