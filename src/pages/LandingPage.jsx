import { Link } from 'react-router-dom'

function ShieldIcon() {
  return (
    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
}

function ScaleIcon() {
  return (
    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99.203 1.99.377 3 .52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 5.491Z" />
    </svg>
  )
}

function SampleResultCard() {
  return (
    <div className="relative bg-white rounded-2xl shadow-panel border border-neutral-300 p-6 overflow-hidden">
      {/* Watermark badge */}
      <div className="absolute top-4 right-4">
        <span className="bg-neutral-100 text-neutral-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-neutral-300 tracking-wide uppercase">
          Sample Result
        </span>
      </div>

      {/* Winner badge */}
      <div className="mb-5">
        <span className="inline-flex items-center gap-1.5 bg-success-light text-success text-sm font-semibold px-3 py-1.5 rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          New Regime Wins
        </span>
      </div>

      {/* Savings callout */}
      <div className="bg-success-light rounded-xl px-4 py-3 mb-5">
        <p className="text-success font-bold text-xl">You save ₹43,500 / year</p>
        <p className="text-success text-sm mt-0.5 opacity-80">by choosing the New Regime</p>
      </div>

      {/* Comparison table */}
      <div className="border border-neutral-300 rounded-xl overflow-hidden text-sm">
        <div className="grid grid-cols-3 bg-neutral-100 px-3 py-2">
          <span className="text-neutral-600 font-medium text-xs uppercase tracking-wide"></span>
          <span className="text-center text-neutral-600 font-semibold text-xs">Old Regime</span>
          <span className="text-center text-primary font-semibold text-xs">New Regime</span>
        </div>
        {[
          { label: 'Gross Salary', old: '₹15,00,000', newVal: '₹15,00,000' },
          { label: 'Deductions', old: '₹3,25,000', newVal: '₹75,000' },
          { label: 'Taxable Income', old: '₹11,75,000', newVal: '₹14,25,000' },
          { label: 'Tax', old: '₹2,37,500', newVal: '₹1,94,000', highlight: true },
        ].map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-3 px-3 py-2 border-t border-neutral-300 ${row.highlight ? 'bg-primary-light' : ''}`}
          >
            <span className={`text-neutral-600 text-xs ${row.highlight ? 'font-semibold text-neutral-900' : ''}`}>{row.label}</span>
            <span className={`text-center text-xs ${row.highlight ? 'font-bold text-neutral-900 line-through decoration-warning' : 'text-neutral-600'}`}>{row.old}</span>
            <span className={`text-center text-xs ${row.highlight ? 'font-bold text-primary' : 'text-neutral-600'}`}>{row.newVal}</span>
          </div>
        ))}
      </div>

      <p className="text-neutral-600 text-xs mt-3 text-center italic">
        Based on ₹15L salary, metro city, standard deductions
      </p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/50 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-60px] w-[350px] h-[350px] rounded-full bg-indigo-300/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Nav bar */}
        <header className="flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">₹</span>
            </div>
            <span className="font-semibold text-neutral-900 text-sm">TaxCompare</span>
          </div>
          <span className="text-neutral-600 text-xs bg-white/70 border border-neutral-300 rounded-full px-3 py-1">
            FY 2025-26 (AY 2026-27)
          </span>
        </header>

        {/* Hero section */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16 pt-10 pb-16 lg:pt-16 lg:pb-24">
          {/* Left column — 60% */}
          <div className="flex-1 lg:max-w-[58%]">
            <div className="inline-flex items-center gap-2 bg-primary-light border border-primary/20 rounded-full px-3 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-primary text-xs font-semibold">Updated for Budget 2025</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 leading-[1.15] tracking-tight mb-5">
              Which tax regime
              <span className="text-primary"> saves you more</span>{' '}
              money?
            </h1>

            <p className="text-lg text-neutral-600 leading-relaxed mb-8 max-w-lg">
              Tell us your monthly salary. We'll do the math — for free, in under 2 minutes.
            </p>

            {/* Trust badges */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {[
                { icon: <ShieldIcon />, text: '100% Private — Nothing leaves your browser' },
                { icon: <CalendarIcon />, text: 'FY 2025-26 rules — Budget 2025' },
                { icon: <ScaleIcon />, text: 'Old vs New Regime — Side by side' },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/80 border border-neutral-300 rounded-xl px-3 py-2.5 flex-1 shadow-sm"
                >
                  {badge.icon}
                  <span className="text-neutral-900 text-xs font-medium leading-tight">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-md shadow-primary/20"
              >
                Find Out Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <p className="text-neutral-600 text-sm">
                No sign-up. No email. No data stored.
              </p>
            </div>
          </div>

          {/* Right column — 40% */}
          <div className="lg:max-w-[40%] w-full lg:flex-none lg:w-[40%]">
            <SampleResultCard />
          </div>
        </div>

        {/* Footer strip */}
        <div className="border-t border-neutral-300/60 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-neutral-600 text-xs">
            Tax data sourced from Income Tax Department of India · Budget 2025
          </p>
          <p className="text-neutral-600 text-xs">
            For salaried individuals · FY 2025-26 only
          </p>
        </div>
      </div>
    </div>
  )
}
