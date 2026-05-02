import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTax } from '../context/TaxContext'
import { computeTax, formatINR } from '../engine/taxEngine'

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(rate) {
  return `${Math.round(rate * 100)}%`
}

function getVerdict(nr, or, winner) {
  if (winner === 'new' && nr.taxableIncome <= 1200000) {
    return 'Your income is below ₹12 lakh after standard deduction, so you pay zero tax under the New Regime.'
  }
  if (winner === 'new') {
    return "The New Regime's lower slab rates outweigh your deductions under the Old Regime."
  }
  if (winner === 'old' && or.deduction24b > 0 && or.hraExemption > 0) {
    return 'Your home loan interest and HRA together reduce your taxable income significantly, making the Old Regime better.'
  }
  if (winner === 'old' && or.deduction24b > 0) {
    return 'Your home loan interest deduction makes the Old Regime more efficient.'
  }
  if (winner === 'old') {
    return "Your investments and deductions reduce your taxable income enough to beat the New Regime's lower rates."
  }
  return null
}

function getSuggestions(result, state) {
  const { newRegime: nr, oldRegime: or, winner } = result
  const list = []

  // 1 — 80C gap (old regime winner or very close)
  if (winner === 'old' || nr.totalTax - or.totalTax < 10000) {
    const used80C = (state.pfDeductedMonthly || 0) * 12 + (state.investments80C || 0) + (state.homeLoanPrincipal || 0)
    const gap = 150000 - used80C
    if (gap > 5000) {
      const marginalRate = or.slabBreakdown.length > 0 ? or.slabBreakdown[or.slabBreakdown.length - 1].rate : 0
      const saving = Math.round(gap * marginalRate * 1.04)
      list.push(
        `You haven't fully used your ₹1.5L Section 80C limit — ` +
        `${formatINR(gap)} of room remains in ELSS, PPF, or LIC premium. ` +
        (saving > 0 ? `This could save you approximately ${formatINR(saving)} more in Old Regime tax.` : '')
      )
    }
  }

  // 2 — NPS benefit (old regime winner, no employee NPS yet)
  if (winner === 'old' && or.deduction80CCD1B === 0) {
    const marginalRate = or.slabBreakdown.length > 0 ? or.slabBreakdown[or.slabBreakdown.length - 1].rate : 0
    if (marginalRate > 0) {
      const saving = Math.round(50000 * marginalRate * 1.04)
      list.push(
        `You can invest up to ₹50,000/year in NPS (Section 80CCD(1B)) for an extra deduction ` +
        `above your ₹1.5L 80C limit — Old Regime only. At your income level this could save you ` +
        `approximately ${formatINR(saving)} more.`
      )
    }
  }

  // 3 — Pays rent but new regime still wins
  if ((state.monthlyRent || 0) > 0 && winner === 'new') {
    list.push(
      "You pay rent but the HRA benefit under the Old Regime isn't enough to beat the New Regime. " +
      "This is common for incomes below ₹15L with moderate rent — the New Regime's lower slab rates are more powerful."
    )
  }

  // 4 — No health insurance
  if (!state.healthInsuranceSelf) {
    list.push(
      'You haven\'t entered a health insurance premium. Beyond the 80D tax benefit under the Old Regime ' +
      '(up to ₹25,000/year), health insurance protects you from large out-of-pocket medical costs. ' +
      'Consider a family floater plan.'
    )
  }

  // 5 — Regimes are very close
  if (Math.abs(or.totalTax - nr.totalTax) < 5000 && Math.abs(or.totalTax - nr.totalTax) >= 0) {
    list.push(
      `The difference between both regimes is just ${formatINR(Math.abs(or.totalTax - nr.totalTax))}. ` +
      'If you prefer simplicity and don\'t want to maintain investment proofs, the New Regime is easier to manage.'
    )
  }

  // 6 — New regime winner but no employer NPS
  if (winner === 'new' && !state.npsEmployerMonthly) {
    list.push(
      'Ask your HR if they offer an NPS co-contribution option. Under the New Regime, ' +
      'employer NPS contributions (up to 14% of basic salary) reduce your taxable income ' +
      'and come out of your CTC, not your take-home.'
    )
  }

  return list.slice(0, 4)
}

function getTopDeductions(or) {
  return [
    { label: 'Standard Deduction', value: or.standardDeduction },
    { label: 'HRA Exemption', value: or.hraExemption },
    { label: '80C', value: or.deduction80C },
    { label: 'Health Insurance (80D)', value: or.deduction80D },
    { label: 'Home Loan Interest', value: or.deduction24b },
    { label: 'Employee NPS (80CCD(1B))', value: or.deduction80CCD1B },
    { label: 'Employer NPS', value: or.employerNPS },
    { label: '80TTA / 80TTB', value: (or.deduction80TTA || 0) + (or.deduction80TTB || 0) },
  ]
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SlabTable({ title, accent, slabBreakdown, rawTax, rebate, effectiveTax, cess, totalTax, monthlyTax }) {
  const marginalRelief = rebate === 0 && effectiveTax < rawTax ? rawTax - effectiveTax : 0
  const headerColor = accent === 'success' ? 'bg-success-light border-success/30 text-success' : 'bg-primary-light border-primary/30 text-primary'

  return (
    <div className="bg-white rounded-2xl border border-neutral-300 shadow-panel overflow-hidden">
      <div className={`px-5 py-3 border-b border-neutral-300 ${headerColor}`}>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-neutral-100 border-b border-neutral-200">
            <th className="text-left px-4 py-2 font-semibold text-neutral-500 uppercase tracking-wide">Slab</th>
            <th className="text-right px-3 py-2 font-semibold text-neutral-500 uppercase tracking-wide">Rate</th>
            <th className="text-right px-4 py-2 font-semibold text-neutral-500 uppercase tracking-wide">Tax</th>
          </tr>
        </thead>
        <tbody>
          {slabBreakdown.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-3 text-neutral-500 text-center">Taxable income is ₹0 — no tax</td>
            </tr>
          ) : (
            slabBreakdown.map((row, i) => (
              <tr key={i} className="border-t border-neutral-100">
                <td className="px-4 py-2 text-neutral-600">{row.label}</td>
                <td className="px-3 py-2 text-right text-neutral-500 tabular-nums">{pct(row.rate)}</td>
                <td className="px-4 py-2 text-right text-neutral-700 tabular-nums font-medium">{formatINR(row.tax)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="border-t-2 border-neutral-200">
          <tr className="bg-neutral-50">
            <td className="px-4 py-2 text-neutral-600 font-medium" colSpan={2}>Subtotal</td>
            <td className="px-4 py-2 text-right tabular-nums font-medium text-neutral-900">{formatINR(rawTax)}</td>
          </tr>
          {rebate > 0 && (
            <tr className="border-t border-neutral-100">
              <td className="px-4 py-2 text-neutral-600" colSpan={2}>Less: 87A Rebate</td>
              <td className="px-4 py-2 text-right tabular-nums text-success font-medium">−{formatINR(rebate)}</td>
            </tr>
          )}
          {marginalRelief > 0 && (
            <tr className="border-t border-neutral-100">
              <td className="px-4 py-2 text-neutral-600" colSpan={2}>Less: Marginal Relief</td>
              <td className="px-4 py-2 text-right tabular-nums text-success font-medium">−{formatINR(marginalRelief)}</td>
            </tr>
          )}
          <tr className="border-t border-neutral-100">
            <td className="px-4 py-2 text-neutral-600" colSpan={2}>Add: Cess (4%)</td>
            <td className="px-4 py-2 text-right tabular-nums text-neutral-600">+{formatINR(cess)}</td>
          </tr>
          <tr className="border-t-2 border-neutral-300 bg-neutral-100">
            <td className="px-4 py-2.5 font-bold text-neutral-900" colSpan={2}>Total Tax</td>
            <td className="px-4 py-2.5 text-right font-bold tabular-nums text-neutral-900">{formatINR(totalTax)}</td>
          </tr>
          <tr className="border-t border-neutral-200">
            <td className="px-4 py-2 text-neutral-500" colSpan={2}>Monthly TDS (approx.)</td>
            <td className="px-4 py-2 text-right tabular-nums text-neutral-500">{formatINR(monthlyTax)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function DeductionRow({ label, oldVal, newVal, bold }) {
  const cell = 'px-5 py-2.5 tabular-nums text-right text-sm'
  const textOld = bold ? 'font-semibold text-neutral-900' : 'text-neutral-600'
  const textNew = bold ? 'font-semibold text-neutral-900' : 'text-neutral-500'
  return (
    <tr className="border-t border-neutral-100">
      <td className={`px-5 py-2.5 text-sm ${bold ? 'font-semibold text-neutral-900' : 'text-neutral-600'}`}>{label}</td>
      <td className={`${cell} ${textOld}`}>{oldVal != null ? formatINR(oldVal) : '—'}</td>
      <td className={`${cell} ${textNew}`}>{newVal != null ? formatINR(newVal) : '—'}</td>
    </tr>
  )
}

function FullComparisonTable({ or, nr, winner }) {
  const winnerIs = (regime) => winner === regime

  return (
    <div className="bg-white rounded-2xl border border-neutral-300 shadow-panel overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-neutral-300">
        <h2 className="text-base font-semibold text-neutral-900">Deductions Comparison</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-100 border-b border-neutral-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-1/2">Item</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide">Old Regime</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-primary uppercase tracking-wide">New Regime</th>
            </tr>
          </thead>
          <tbody>
            <DeductionRow label="Estimated Gross Salary" oldVal={or.grossSalary} newVal={nr.grossSalary} />
            <DeductionRow label="Standard Deduction" oldVal={or.standardDeduction} newVal={nr.standardDeduction} />
            <DeductionRow label="Professional Tax" oldVal={or.profTax} newVal={nr.profTax} />
            {or.hraExemption > 0 && <DeductionRow label="HRA Exemption" oldVal={or.hraExemption} newVal={null} />}
            {or.deduction80C > 0 && <DeductionRow label="80C (PF + investments + principal)" oldVal={or.deduction80C} newVal={null} />}
            {or.deduction80D > 0 && <DeductionRow label="Health Insurance (80D)" oldVal={or.deduction80D} newVal={null} />}
            {or.deduction24b > 0 && <DeductionRow label="Home Loan Interest (24b)" oldVal={or.deduction24b} newVal={null} />}
            {or.deduction80CCD1B > 0 && <DeductionRow label="Employee NPS (80CCD(1B))" oldVal={or.deduction80CCD1B} newVal={null} />}
            {(or.employerNPS > 0 || nr.employerNPS > 0) && (
              <DeductionRow label="Employer NPS (80CCD(2))" oldVal={or.employerNPS} newVal={nr.employerNPS} />
            )}
            {(or.deduction80TTA + or.deduction80TTB) > 0 && (
              <DeductionRow label="80TTA / 80TTB" oldVal={(or.deduction80TTA || 0) + (or.deduction80TTB || 0)} newVal={null} />
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-neutral-200 bg-neutral-50">
              <td className="px-5 py-3 text-sm font-semibold text-neutral-900">Total Deductions</td>
              <td className="px-5 py-3 text-right text-sm font-semibold text-neutral-900 tabular-nums">{formatINR(or.totalDeductions)}</td>
              <td className="px-5 py-3 text-right text-sm font-semibold text-neutral-900 tabular-nums">{formatINR(nr.totalDeductions)}</td>
            </tr>
            <tr className={`border-t-2 border-neutral-200 ${winnerIs('new') ? 'bg-success-light/50' : winnerIs('old') ? 'bg-primary-light/50' : 'bg-neutral-50'}`}>
              <td className="px-5 py-3 text-sm font-bold text-neutral-900">Taxable Income</td>
              <td className={`px-5 py-3 text-right text-sm font-bold tabular-nums ${winnerIs('old') ? 'text-primary' : 'text-neutral-900'}`}>
                {formatINR(or.taxableIncome)}
                {winnerIs('old') && <span className="ml-1.5 text-xs font-semibold bg-primary-light text-primary px-1.5 py-0.5 rounded-full">Lower</span>}
              </td>
              <td className={`px-5 py-3 text-right text-sm font-bold tabular-nums ${winnerIs('new') ? 'text-success' : 'text-neutral-900'}`}>
                {formatINR(nr.taxableIncome)}
                {winnerIs('new') && <span className="ml-1.5 text-xs font-semibold bg-success-light text-success px-1.5 py-0.5 rounded-full">Lower</span>}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const navigate = useNavigate()
  const { state } = useTax()
  const result = useMemo(() => computeTax(state), [state])

  if (!result) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl border border-neutral-300 shadow-panel p-10">
          <p className="text-neutral-600 mb-5">No data entered yet — please complete the calculator first.</p>
          <Link to="/calculator" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl text-sm">
            Go to Calculator →
          </Link>
        </div>
      </div>
    )
  }

  const { newRegime: nr, oldRegime: or, savings, winner } = result
  const reason = getVerdict(nr, or, winner)
  const suggestions = getSuggestions(result, state)
  const topDeductions = getTopDeductions(or)

  const headline =
    winner === 'new' ? `Go with the New Regime. You save ${formatINR(savings)} this year.`
    : winner === 'old' ? `Go with the Old Regime. You save ${formatINR(savings)} this year.`
    : 'Both regimes result in the same tax for you.'

  const bannerBg   = winner === 'new' ? 'bg-success-light border-success/20' : winner === 'old' ? 'bg-primary-light border-primary/20' : 'bg-neutral-100 border-neutral-300'
  const accentText = winner === 'new' ? 'text-success' : winner === 'old' ? 'text-primary' : 'text-neutral-900'
  const iconBg     = winner === 'new' ? 'bg-success' : winner === 'old' ? 'bg-primary' : 'bg-neutral-500'

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">₹</span>
            </div>
            <span className="font-semibold text-neutral-900 text-sm">TaxCompare</span>
          </Link>
          <span className="text-neutral-600 text-xs bg-white border border-neutral-300 rounded-full px-3 py-1">FY 2025-26</span>
        </div>

        {/* 1 — Verdict Banner */}
        <div className={`rounded-2xl border p-6 mb-6 ${bannerBg}`}>
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <h1 className={`text-xl font-bold leading-snug ${accentText}`}>{headline}</h1>
              <p className="text-neutral-600 text-sm mt-1">
                Based on estimated gross salary of {formatINR(nr.grossSalary)} / year
              </p>
              {reason && (
                <p className="text-neutral-600 text-xs mt-2 leading-relaxed">{reason}</p>
              )}
            </div>
          </div>
        </div>

        {/* 2 — Deductions comparison */}
        <FullComparisonTable or={or} nr={nr} winner={winner} />

        {/* 3 — Slab breakdown */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Tax Calculation Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SlabTable
              title="Old Regime"
              accent="primary"
              slabBreakdown={or.slabBreakdown}
              rawTax={or.rawTax}
              rebate={or.rebate}
              effectiveTax={or.effectiveTax}
              cess={or.cess}
              totalTax={or.totalTax}
              monthlyTax={or.monthlyTax}
            />
            <SlabTable
              title="New Regime"
              accent="success"
              slabBreakdown={nr.slabBreakdown}
              rawTax={nr.rawTax}
              rebate={nr.rebate}
              effectiveTax={nr.effectiveTax}
              cess={nr.cess}
              totalTax={nr.totalTax}
              monthlyTax={nr.monthlyTax}
            />
          </div>
        </div>

        {/* 4 — Explanation */}
        <div className="bg-white rounded-2xl border border-neutral-300 shadow-panel p-6 mb-6">
          <h2 className="text-base font-semibold text-neutral-900 mb-3">How this works for you</h2>
          <div className="space-y-2.5 text-sm text-neutral-600 leading-relaxed">
            <p>
              Your estimated annual salary is{' '}
              <strong className="text-neutral-900">{formatINR(or.grossSalary)}</strong>.
              Under the Old Regime, your total deductions come to{' '}
              <strong className="text-neutral-900">{formatINR(or.totalDeductions)}</strong>, bringing taxable income down to{' '}
              <strong className="text-neutral-900">{formatINR(or.taxableIncome)}</strong>.
              Under the New Regime, with only a ₹75,000 standard deduction, taxable income is{' '}
              <strong className="text-neutral-900">{formatINR(nr.taxableIncome)}</strong>.
            </p>
            {winner !== 'tie' && (
              <p>
                {winner === 'old'
                  ? 'Despite the Old Regime\'s higher slab rates, your deductions reduce the tax base enough that it comes out ahead.'
                  : nr.taxableIncome <= 1200000
                    ? 'Since your taxable income under the New Regime is ₹12 lakh or below, the ₹60,000 Section 87A rebate wipes out your entire tax liability.'
                    : "The New Regime's lower slab rates work better for your income and investment profile."}
              </p>
            )}
            {topDeductions.length > 0 && (
              <p>
                The biggest factors in your Old Regime calculation:{' '}
                {topDeductions.map((d, i) => (
                  <span key={d.label}>
                    <strong className="text-neutral-900">{d.label}</strong>{' '}
                    <span className="tabular-nums">({formatINR(d.value)})</span>
                    {i < topDeductions.length - 1 ? ' and ' : ''}
                  </span>
                ))}.
              </p>
            )}
          </div>
        </div>

        {/* 5 — Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-300 shadow-panel p-6 mb-6">
            <h2 className="text-base font-semibold text-neutral-900 mb-4">Actionable suggestions for you</h2>
            <ol className="space-y-4">
              {suggestions.map((text, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 6 — Back CTA */}
        <button
          onClick={() => navigate('/calculator')}
          className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Change my inputs
        </button>

      </div>
    </div>
  )
}
