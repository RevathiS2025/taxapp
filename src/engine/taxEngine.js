// ─── Formatting ──────────────────────────────────────────────────────────────

export function formatINR(n) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n))
}

// ─── Gross Salary Reconstruction ─────────────────────────────────────────────

export function reconstructGross(state) {
  const annualTakeHome = (state.monthlyTakeHome || 0) * 12
  const pfAnnual = (state.pfDeductedMonthly || 0) * 12
  const profTax = state.professionalTax ?? 2400
  const grossSalary = annualTakeHome + pfAnnual + profTax
  const basicSalary = grossSalary * 0.40
  return { annualTakeHome, grossSalary, basicSalary }
}

// ─── Slab Tables ─────────────────────────────────────────────────────────────

const NEW_SLABS = [
  { floor: 0,       ceiling: 400000,  rate: 0,    label: 'Up to ₹4,00,000' },
  { floor: 400000,  ceiling: 800000,  rate: 0.05, label: '₹4,00,001 – ₹8,00,000' },
  { floor: 800000,  ceiling: 1200000, rate: 0.10, label: '₹8,00,001 – ₹12,00,000' },
  { floor: 1200000, ceiling: 1600000, rate: 0.15, label: '₹12,00,001 – ₹16,00,000' },
  { floor: 1600000, ceiling: 2000000, rate: 0.20, label: '₹16,00,001 – ₹20,00,000' },
  { floor: 2000000, ceiling: 2400000, rate: 0.25, label: '₹20,00,001 – ₹24,00,000' },
  { floor: 2400000, ceiling: Infinity, rate: 0.30, label: 'Above ₹24,00,000' },
]

const OLD_SLABS_BELOW60 = [
  { floor: 0,       ceiling: 250000,  rate: 0,    label: 'Up to ₹2,50,000' },
  { floor: 250000,  ceiling: 500000,  rate: 0.05, label: '₹2,50,001 – ₹5,00,000' },
  { floor: 500000,  ceiling: 1000000, rate: 0.20, label: '₹5,00,001 – ₹10,00,000' },
  { floor: 1000000, ceiling: Infinity, rate: 0.30, label: 'Above ₹10,00,000' },
]

const OLD_SLABS_SENIOR = [
  { floor: 0,       ceiling: 300000,  rate: 0,    label: 'Up to ₹3,00,000' },
  { floor: 300000,  ceiling: 500000,  rate: 0.05, label: '₹3,00,001 – ₹5,00,000' },
  { floor: 500000,  ceiling: 1000000, rate: 0.20, label: '₹5,00,001 – ₹10,00,000' },
  { floor: 1000000, ceiling: Infinity, rate: 0.30, label: 'Above ₹10,00,000' },
]

const OLD_SLABS_SUPERSENIOR = [
  { floor: 0,       ceiling: 500000,  rate: 0,    label: 'Up to ₹5,00,000' },
  { floor: 500000,  ceiling: 1000000, rate: 0.20, label: '₹5,00,001 – ₹10,00,000' },
  { floor: 1000000, ceiling: Infinity, rate: 0.30, label: 'Above ₹10,00,000' },
]

function applySlabs(income, slabs) {
  let tax = 0
  const breakdown = []
  for (const slab of slabs) {
    if (income <= slab.floor) break
    const taxable = Math.min(income, slab.ceiling) - slab.floor
    const slabTax = Math.round(taxable * slab.rate)
    tax += slabTax
    breakdown.push({ label: slab.label, rate: slab.rate, taxable, tax: slabTax })
  }
  return { tax: Math.round(tax), breakdown }
}

export function applyNewRegimeSlabs(income) {
  return applySlabs(income, NEW_SLABS)
}

export function applyOldRegimeSlabs(income, age = 'below60') {
  const slabs =
    age === 'supersenior' ? OLD_SLABS_SUPERSENIOR
    : age === 'senior'    ? OLD_SLABS_SENIOR
    : OLD_SLABS_BELOW60
  return applySlabs(income, slabs)
}

// ─── HRA Exemption ───────────────────────────────────────────────────────────

export function computeHRAExemption({ monthlyRent, city, basicSalary }) {
  if (!monthlyRent || monthlyRent <= 0) return 0
  const hraReceived = basicSalary * 0.50
  const percentageOfBasic = basicSalary * (city === 'metro' ? 0.50 : 0.40)
  const excessRent = Math.max(monthlyRent * 12 - basicSalary * 0.10, 0)
  return Math.round(Math.min(hraReceived, percentageOfBasic, excessRent))
}

// ─── New Regime ───────────────────────────────────────────────────────────────

export function computeNewRegime(state) {
  const s = { professionalTax: 2400, npsEmployerMonthly: 0, ...state }
  const { grossSalary, basicSalary } = reconstructGross(s)

  const standardDeduction = 75000
  const profTax = s.professionalTax ?? 2400
  const employerNPS = Math.min((s.npsEmployerMonthly || 0) * 12, basicSalary * 0.14)
  const taxableIncome = Math.max(grossSalary - standardDeduction - profTax - employerNPS, 0)

  const { tax: rawTax, breakdown: slabBreakdown } = applyNewRegimeSlabs(taxableIncome)

  let rebate = 0
  let effectiveTax = rawTax
  if (taxableIncome <= 1200000) {
    rebate = Math.min(rawTax, 60000)
    effectiveTax = rawTax - rebate
  } else {
    // Marginal relief: tax cannot exceed income above ₹12L
    effectiveTax = Math.min(rawTax, taxableIncome - 1200000)
  }

  const cess = Math.round(effectiveTax * 0.04)
  const totalTax = effectiveTax + cess

  return {
    regime: 'new',
    grossSalary,
    basicSalary,
    standardDeduction,
    profTax,
    employerNPS,
    hraExemption: 0,
    deduction80C: 0,
    deduction80D: 0,
    deduction24b: 0,
    deduction80CCD1B: 0,
    deduction80TTA: 0,
    deduction80TTB: 0,
    totalDeductions: standardDeduction + profTax + employerNPS,
    taxableIncome,
    rawTax,
    rebate,
    effectiveTax,
    cess,
    totalTax,
    monthlyTax: Math.round(totalTax / 12),
    slabBreakdown,
  }
}

// ─── Old Regime ───────────────────────────────────────────────────────────────

export function computeOldRegime(state) {
  const s = {
    professionalTax: 2400,
    pfDeductedMonthly: 0,
    investments80C: 0,
    healthInsuranceSelf: 0,
    healthInsuranceParents: 0,
    parentsAreSenior: false,
    homeLoanInterest: 0,
    homeLoanPrincipal: 0,
    npsEmployeeMonthly: 0,
    npsEmployerMonthly: 0,
    savingsInterest: 0,
    monthlyRent: 0,
    city: 'non-metro',
    age: 'below60',
    ...state,
  }
  const { grossSalary, basicSalary } = reconstructGross(s)

  const standardDeduction = 50000
  const profTax = s.professionalTax ?? 2400
  const hraExemption = computeHRAExemption({ monthlyRent: s.monthlyRent, city: s.city, basicSalary })

  const total80CRaw = (s.pfDeductedMonthly || 0) * 12 + (s.investments80C || 0) + (s.homeLoanPrincipal || 0)
  const deduction80C = Math.min(total80CRaw, 150000)

  const deduction80DSelf = Math.min(s.healthInsuranceSelf || 0, 25000)
  const deduction80DParents = s.parentsAreSenior
    ? Math.min(s.healthInsuranceParents || 0, 50000)
    : Math.min(s.healthInsuranceParents || 0, 25000)
  const deduction80D = deduction80DSelf + deduction80DParents

  const deduction24b = Math.min(s.homeLoanInterest || 0, 200000)
  const deduction80CCD1B = Math.min((s.npsEmployeeMonthly || 0) * 12, 50000)
  const employerNPS = Math.min((s.npsEmployerMonthly || 0) * 12, basicSalary * 0.10)

  let deduction80TTA = 0
  let deduction80TTB = 0
  if (s.age === 'senior' || s.age === 'supersenior') {
    deduction80TTB = Math.min(s.savingsInterest || 0, 50000)
  } else {
    deduction80TTA = Math.min(s.savingsInterest || 0, 10000)
  }

  const totalDeductions =
    standardDeduction + profTax + hraExemption +
    deduction80C + deduction80D + deduction24b +
    deduction80CCD1B + employerNPS +
    deduction80TTA + deduction80TTB

  const taxableIncome = Math.max(grossSalary - totalDeductions, 0)
  const { tax: rawTax, breakdown: slabBreakdown } = applyOldRegimeSlabs(taxableIncome, s.age)

  const rebate = taxableIncome <= 500000 ? Math.min(rawTax, 12500) : 0
  const effectiveTax = rawTax - rebate
  const cess = Math.round(effectiveTax * 0.04)
  const totalTax = effectiveTax + cess

  return {
    regime: 'old',
    grossSalary,
    basicSalary,
    standardDeduction,
    profTax,
    employerNPS,
    hraExemption,
    deduction80C,
    deduction80D,
    deduction24b,
    deduction80CCD1B,
    deduction80TTA,
    deduction80TTB,
    totalDeductions,
    taxableIncome,
    rawTax,
    rebate,
    effectiveTax,
    cess,
    totalTax,
    monthlyTax: Math.round(totalTax / 12),
    slabBreakdown,
  }
}

// ─── Combined ─────────────────────────────────────────────────────────────────

export function computeTax(state) {
  if (!state?.monthlyTakeHome) return null
  const newRegime = computeNewRegime(state)
  const oldRegime = computeOldRegime(state)
  const savings = Math.abs(newRegime.totalTax - oldRegime.totalTax)
  const winner =
    newRegime.totalTax < oldRegime.totalTax ? 'new' :
    newRegime.totalTax > oldRegime.totalTax ? 'old' : 'tie'
  return { newRegime, oldRegime, savings, winner }
}
