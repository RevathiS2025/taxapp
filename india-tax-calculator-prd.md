# PRD: India Salary Tax Calculator FY 2025-26
## Old Regime vs New Regime Comparison — Salaried Individuals Only

**Version:** 1.0  
**Scope:** Salaried individuals, FY 2025-26 (AY 2026-27), India  
**Out of scope:** Capital gains, freelance/business income, surcharge above ₹50L, NRI taxation  
**Privacy model:** 100% client-side computation. No data leaves the browser. No backend required.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Goals and Non-Goals](#2-goals-and-non-goals)
3. [User Personas](#3-user-personas)
4. [App Architecture Overview](#4-app-architecture-overview)
5. [Screen-by-Screen Specification](#5-screen-by-screen-specification)
   - 5.1 Landing Page
   - 5.2 Wizard — Step 1: Monthly Take-Home
   - 5.3 Wizard — Step 2: City and Rent
   - 5.4 Wizard — Step 3: Provident Fund
   - 5.5 Wizard — Step 4: 80C Investments
   - 5.6 Wizard — Step 5: Health Insurance
   - 5.7 Wizard — Step 6: Home Loan
   - 5.8 Wizard — Step 7: NPS
   - 5.9 Wizard — Step 8: Other Income / Deductions
   - 5.10 Wizard — Step 9: Age
   - 5.11 Results Page
6. [Live Preview Panel Specification](#6-live-preview-panel-specification)
7. [Tax Logic and Calculation Engine](#7-tax-logic-and-calculation-engine)
   - 7.1 Gross Salary Reconstruction
   - 7.2 New Regime Calculation
   - 7.3 Old Regime Calculation
   - 7.4 HRA Exemption Formula
   - 7.5 Section 87A Rebate and Marginal Relief
   - 7.6 Cess
   - 7.7 Deduction Rules by Regime
8. [Validation Rules](#8-validation-rules)
9. [Result Page Logic](#9-result-page-logic)
10. [Personalized Suggestions Engine](#10-personalized-suggestions-engine)
11. [Design System](#11-design-system)
12. [FAQ Content per Step](#12-faq-content-per-step)
13. [Tax Data Reference (FY 2025-26)](#13-tax-data-reference-fy-2025-26)
14. [Edge Cases](#14-edge-cases)
15. [Technical Implementation Notes](#15-technical-implementation-notes)

---

## 1. Problem Statement

Every year, crores of salaried Indians are required to choose between the Old Tax Regime and the New Tax Regime when filing their ITR. The wrong choice can cost them thousands of rupees.

Existing calculators fail because:
- They ask for CTC or gross salary — most salaried employees only know their in-hand (take-home) monthly salary
- They use finance jargon: "Chapter VI-A deductions", "taxable income", "Section 87A rebate"
- The interface is a single long form — overwhelming and unintuitive
- There is no live feedback while filling in data
- Results are a wall of numbers without a clear verdict

This app solves it by:
- Starting from monthly take-home pay (what lands in the bank account)
- Asking one question at a time in plain language
- Showing a live tax estimate on the right that updates on every input
- Delivering a clear, single-sentence verdict at the end: **"Pick New Regime. You save ₹X."**

---

## 2. Goals and Non-Goals

### Goals
- Salaried individual enters their monthly take-home salary and answers a few plain-language questions
- App reconstructs their approximate gross/taxable income
- App computes tax under both regimes correctly for FY 2025-26
- App shows a side-by-side comparison, slab-by-slab breakdown, and a one-line verdict
- App gives personalized, actionable suggestions based on the user's inputs
- All computation happens in-browser; no data is transmitted anywhere

### Non-Goals
- Not a tax filing tool — no ITR submission
- Does not handle freelance income, capital gains, rental income (as main income), or NRI taxation
- Does not handle surcharge (applicable above ₹50L taxable income — out of scope per product decision)
- Does not generate a PDF report
- Does not require login or account creation
- Does not handle more than one source of salary income

---

## 3. User Personas

**Persona A — First Job (21–26 years)**
- Annual CTC: ₹4L–₹10L
- Does not understand CTC vs take-home difference
- Knows exactly what hits their bank account every month
- Has EPF deducted automatically; may have basic 80C investments (LIC, ELSS)
- Likely to be better off in new regime

**Persona B — Mid-Career Professional (27–38 years)**
- Annual CTC: ₹10L–₹25L
- Pays rent in a metro city (HRA benefit relevant)
- May have a home loan or active 80C / 80D investments
- Decision between regimes is genuinely close — needs the calculator most
- The app must show the exact savings difference clearly

**Persona C — Senior Employee (38–55 years)**
- Annual CTC: ₹25L+
- Has home loan, NPS, full 80C utilisation, high 80D premiums
- May be a senior citizen (60+) — different exemption limits under old regime
- Old regime often better in this profile

---

## 4. App Architecture Overview

```
/                  → Landing Page
/calculator        → Wizard (Steps 1–9) + Live Preview Panel
/results           → Results Page
```

The wizard and the results page share the same state object (described in Section 7). Navigation is handled via a URL hash or React Router, keeping everything client-side.

**State object shape (JavaScript):**

```js
{
  monthlyTakeHome: null,           // number (INR)
  city: null,                      // 'metro' | 'non-metro'
  monthlyRent: null,               // number (INR), 0 if no rent
  pfDeductedMonthly: null,         // number (INR), 0 if none
  epfMonthlyEmployer: null,        // number (INR) — employer contribution
  investments80C: null,            // number (INR) — other 80C beyond PF
  healthInsuranceSelf: null,       // number (INR) — annual premium self+spouse+children
  healthInsuranceParents: null,    // number (INR) — annual premium for parents
  parentsAreSenior: null,          // boolean
  homeLoanInterest: null,          // number (INR) — annual interest paid, self-occupied
  homeLoanPrincipal: null,         // number (INR) — annual principal repaid (counts in 80C)
  npsEmployeeMonthly: null,        // number (INR) — employee's own NPS contribution/month
  npsEmployerMonthly: null,        // number (INR) — employer's NPS contribution/month
  savingsInterest: null,           // number (INR) — annual savings account interest
  age: null,                       // 'below60' | 'senior' (60-79) | 'supersenior' (80+)
  professionalTax: 2400,           // INR annual — defaulted, user can adjust
}
```

---

## 5. Screen-by-Screen Specification

---

### 5.1 Landing Page

**URL:** `/`

**Purpose:** Build trust and motivate the user to start. Must not look like a blank form page.

**Layout:** Full-viewport, two-column on desktop, single-column on mobile.

**Left column (60% width):**
- Large headline: `"Which tax regime saves you more money?"`
- Sub-headline: `"Tell us your monthly salary. We'll do the math — for free, in under 2 minutes."`
- Three trust badges:
  - `"100% Private — Nothing leaves your browser"`
  - `"FY 2025-26 tax rules — Updated for Budget 2025"`
  - `"Old vs New Regime — Side by side"`
- CTA button: `"Find Out Now →"` — navigates to `/calculator`
- Under the CTA, small text: `"No sign-up. No email. No data stored."`

**Right column (40% width):**
- A static preview card showing what the result will look like.
- Use realistic but fictional numbers (e.g., "You save ₹43,500 with New Regime").
- Label it visually with a subtle "Sample Result" watermark/badge so users understand it is illustrative.
- The preview should show: regime winner badge, a two-column tax comparison table stub (Old vs New), and a savings callout.

**Mobile:** Stack vertically. CTA appears below the headline. Result preview shown below CTA, collapsed to a smaller card.

**Hero section background:** Not white. Use a light warm off-white or very light blue-grey. Add a subtle geometric or gradient background element to give it depth.

---

### 5.2 Wizard — Step 1: Monthly Take-Home

**Step number:** 1 of 9  
**Progress indicator:** Dots or a progress bar showing 1/9

**Question (displayed large):**
> "How much do you receive in your bank account every month?"

**Sub-text:**
> "This is your in-hand salary — after your company deducts PF, TDS, professional tax, and any other deductions."

**Input:**
- Currency input field, INR symbol prefix (₹)
- Placeholder: `"e.g., 65,000"`
- Input type: number, no decimals
- Comma formatting applied dynamically as user types
- Min: ₹10,000 | Max: ₹10,00,000 (₹10 lakh/month)

**Validation:**
- Required. Cannot be empty or zero.
- If value < ₹10,000: show inline warning `"That seems low. Are you sure this is your monthly take-home?"`
- If value > ₹10,00,000: show inline warning `"That's above ₹1 crore/year. Our calculator is designed for salaries up to ₹1 crore/year. Results may be approximate."`

**FAQ section (collapsed by default, expandable):**

| Question | Answer |
|---|---|
| What is "take-home salary"? | The amount your employer transfers to your bank account every month. It is usually your gross salary minus PF, TDS, professional tax, and other deductions listed on your payslip. |
| My salary varies each month. What should I enter? | Enter the amount you typically receive in a regular month — not a month with bonus or arrears. |
| Should I include my bonus? | No. Bonuses are handled separately by the tax department. For this calculator, enter only your fixed monthly salary. |
| I don't know my exact take-home. | Check your bank statement for the last three months and use the most common recurring credit from your employer. |

---

### 5.3 Wizard — Step 2: City and Rent

**Step number:** 2 of 9

**Question (displayed large):**
> "Do you pay rent? If yes, which city do you live in?"

**Sub-text:**
> "If you pay rent, you may be eligible for a tax exemption called HRA (House Rent Allowance) — but only under the Old Regime."

**Input Section A — Two-option selector:**
- Option 1: `"I pay rent"` (selected → show Section B)
- Option 2: `"I own my home or live rent-free"` (selected → hide Section B, set monthlyRent = 0)

**Input Section B — Shown only if "I pay rent" selected:**

Sub-question 1: `"Monthly rent (₹)"`  
- Currency input, same style as Step 1  
- Placeholder: `"e.g., 18,000"`

Sub-question 2: `"Which city?"`  
- Segmented control or radio:
  - `"Metro city"` — (Mumbai, Delhi, Kolkata, Chennai)
  - `"Other city"` — (any other city in India)
- Below the options, a small explanatory note: `"Metro cities get a higher HRA exemption (50% of basic salary vs 40% for other cities)."`

**FAQ:**

| Question | Answer |
|---|---|
| What counts as a metro city for HRA? | Only these four: Mumbai, Delhi (NCR), Kolkata, Chennai. Bangalore, Hyderabad, Pune, etc. are all "other cities" for HRA purposes. |
| What if I live with my parents and pay them rent? | You can claim HRA if you pay rent to your parents and they declare it as income on their returns. Enter the rent you actually pay them. |
| I pay rent but don't have a rent agreement. Can I still claim? | For amounts above ₹1 lakh/year, a PAN of the landlord is required. For smaller amounts, rent receipts generally suffice. |
| My company doesn't give me HRA as a separate allowance. | Then you cannot claim HRA exemption under the old regime. Leave rent as 0 or enter 0 for rent. |

---

### 5.4 Wizard — Step 3: Provident Fund

**Step number:** 3 of 9

**Question (displayed large):**
> "Does your company deduct Provident Fund (PF) from your salary every month?"

**Sub-text:**
> "PF is usually shown on your payslip as 'EPF' or 'Provident Fund'. Most companies that employ 20 or more people are required to deduct it."

**Input Section A — Yes/No selector:**
- `"Yes, PF is deducted"` → show Section B
- `"No PF deduction"` → set pfDeductedMonthly = 0, epfMonthlyEmployer = 0

**Input Section B — Shown if "Yes" selected:**

Sub-question: `"How much PF is deducted every month? (₹)"`
- Currency input
- Placeholder: `"e.g., 1,800"`
- Helper text: `"Check your payslip. Typically it's 12% of your basic salary. For many salaried employees on ₹30,000–₹60,000 take-home, this is usually ₹1,200–₹3,600/month."`
- Below: a "Not sure?" toggle that shows: `"If your basic salary is ₹X, your PF is approximately ₹X × 12% = ₹Y per month. Your employer also contributes the same amount."`

**Logic note for developer:**
- Employee PF contribution goes into `pfDeductedMonthly`
- Assume employer contribution = same as employee contribution (standard EPF rule: both contribute 12% of basic)
- Both employee and employer PF contributions count toward 80C deduction (capped later at ₹1.5L total 80C)
- In the old regime, employee contribution (up to the 80C cap) is deductible under Section 80C

**FAQ:**

| Question | Answer |
|---|---|
| What is PF / EPF? | Employees' Provident Fund. A retirement savings scheme where you and your employer each contribute a percentage of your basic salary every month. |
| Is PF mandatory? | For companies with 20+ employees, yes. Many startups or small companies may not deduct PF. |
| My PF deduction varies — what should I enter? | Enter the monthly amount shown on your payslip under "EPF" or "PF employee contribution". |
| Does PF reduce my tax? | Yes, under the Old Regime, your PF contribution (employee portion) is eligible for Section 80C deduction (up to ₹1.5L/year combined with other 80C investments). Under the New Regime, no 80C deductions are allowed, but PF still builds your retirement corpus. |

---

### 5.5 Wizard — Step 4: 80C Investments

**Step number:** 4 of 9

**Question (displayed large):**
> "Do you invest in any of these? Tell us how much per year."

**Sub-text:**
> "These investments can reduce your tax under the Old Regime (up to ₹1.5 lakh total per year, including your PF)."

**Input — Checklist with amount fields. Each item has a checkbox + a number input that appears when checked:**

| Item | Label | Placeholder |
|---|---|---|
| ELSS Mutual Funds | `"ELSS / Tax-saving mutual funds"` | `"Annual amount (₹)"` |
| PPF | `"PPF (Public Provident Fund)"` | `"Annual amount (₹)"` |
| Life Insurance Premium | `"Life insurance premium (LIC or other)"` | `"Annual premium (₹)"` |
| NSC | `"NSC (National Savings Certificate)"` | `"Annual amount (₹)"` |
| 5-year Bank FD | `"5-year tax-saving FD"` | `"Annual amount (₹)"` |
| Children's tuition fees | `"Children's school/college tuition fees"` | `"Annual amount (₹)"` |
| Other 80C | `"Any other 80C investment I haven't listed"` | `"Annual amount (₹)"` |

Below the list: a running total display:
`"Your 80C total so far (excluding PF): ₹X  |  Combined with PF: ₹Y  |  Effective 80C deduction: ₹Z (capped at ₹1,50,000)"`

**Logic note for developer:**
- `investments80C` = sum of all checked + entered values from this step (does NOT include PF)
- Combined 80C = `investments80C + (pfDeductedMonthly × 12) + homeLoanPrincipal` (from later step)
- 80C deduction applied = `min(combined 80C total, 150000)`
- This cap is enforced at calculation time, not at input time (user should be allowed to enter more to know they're over-investing)

**FAQ:**

| Question | Answer |
|---|---|
| Does ELSS count toward 80C? | Yes. ELSS (Equity Linked Savings Scheme) is a tax-saving mutual fund and counts fully toward Section 80C. |
| My employer also deducts PF — do I add that here? | No. You already told us your PF deduction in the last step. We're counting it automatically. |
| I already invest ₹1.5L through PF alone. Should I still enter my ELSS? | Yes, enter it. We'll show you the combined amount and let you know if you're over the ₹1.5L cap. |
| What if I don't invest in any of these? | That's fine — just leave this step blank and click Next. |

---

### 5.6 Wizard — Step 5: Health Insurance

**Step number:** 5 of 9

**Question (displayed large):**
> "Do you pay for health insurance (Mediclaim)?"

**Sub-text:**
> "Health insurance premiums can save you tax under the Old Regime under Section 80D."

**Input Section A — Yes/No selector:**
- `"Yes"` → show Section B  
- `"No"` → set healthInsuranceSelf = 0, healthInsuranceParents = 0

**Input Section B — Shown if "Yes":**

Sub-question 1: `"Annual premium for yourself, spouse, and children (₹)"`
- Placeholder: `"e.g., 15,000"`
- Helper: `"Max deduction: ₹25,000/year for self + spouse + children below 60 years old."`

Sub-question 2: `"Do you also pay for your parents' health insurance?"`
- Yes / No toggle
- If Yes: `"Annual premium for parents (₹)"`
  - Placeholder: `"e.g., 28,000"`
  - Sub-question: `"Are your parents senior citizens (60 years or older)?"`
    - Yes / No
    - Helper text: `"If yes, the deduction limit for parents increases to ₹50,000/year."`

**Logic note for developer:**
- Section 80D deduction under old regime:
  - Self + spouse + children: `min(healthInsuranceSelf, 25000)`
  - Parents (non-senior): `min(healthInsuranceParents, 25000)`
  - Parents (senior citizen): `min(healthInsuranceParents, 50000)`
  - Max combined: ₹75,000 (₹25K self + ₹50K senior parents)
- Section 80D is NOT available under new regime

**FAQ:**

| Question | Answer |
|---|---|
| Does my company's group health insurance count? | No. Only premiums you personally pay out-of-pocket qualify for Section 80D deduction. |
| Can I claim 80D for term life insurance? | No. Term life insurance premiums go under Section 80C, not 80D. Only health/medical insurance premiums qualify under 80D. |
| My parents have their own senior citizen health plan. Can I claim it? | Yes, if you are paying the premiums for them, you can claim it under 80D. |

---

### 5.7 Wizard — Step 6: Home Loan

**Step number:** 6 of 9

**Question (displayed large):**
> "Do you have a home loan on a property you live in?"

**Sub-text:**
> "If yes, the interest you pay on that loan can reduce your tax under the Old Regime."

**Input Section A — Yes/No selector:**
- `"Yes"` → show Section B
- `"No"` → set homeLoanInterest = 0, homeLoanPrincipal = 0

**Input Section B — Shown if "Yes":**

Sub-question 1: `"Approximately how much interest did you pay on the loan last year? (₹)"`
- Placeholder: `"e.g., 1,60,000"`
- Helper: `"Check your loan statement or Form 26AS. Interest is separate from principal repayment. Max deduction: ₹2,00,000/year under Section 24(b) for a self-occupied property."`

Sub-question 2: `"Approximately how much principal did you repay last year? (₹)"`
- Placeholder: `"e.g., 80,000"`
- Helper: `"Principal repayment counts toward your Section 80C limit (₹1.5L total combined with PF and other investments)."`

**Logic note for developer:**
- Under old regime: Section 24(b) deduction = `min(homeLoanInterest, 200000)`
- Under new regime: No deduction for self-occupied home loan interest
- `homeLoanPrincipal` adds to the 80C pool (old regime only, within the ₹1.5L cap)

**FAQ:**

| Question | Answer |
|---|---|
| What if I have a home loan but the property is rented out? | This calculator is for self-occupied properties only. Rental income and associated loan deductions involve different rules. |
| Can I claim home loan interest for a property under construction? | You can claim it once possession is received, in five equal instalments. This is an advanced scenario — use a CA for this. |
| My home loan interest is ₹2.5L. Can I claim all of it? | Under the Old Regime, the cap for self-occupied property is ₹2 lakh/year. So you can claim ₹2L maximum. |

---

### 5.8 Wizard — Step 7: NPS

**Step number:** 7 of 9

**Question (displayed large):**
> "Do you contribute to NPS (National Pension System)?"

**Sub-text:**
> "NPS contributions can give you extra tax savings beyond your ₹1.5L 80C limit — but only under the Old Regime."

**Input Section A — Selector:**
- `"My employer contributes to NPS on my behalf"` → show employer input
- `"I contribute to NPS myself (voluntarily)"` → show employee input
- `"Both"` → show both
- `"I don't use NPS"` → set both to 0

**Employer NPS input:**
- `"How much does your employer contribute to NPS per month? (₹)"`
- Placeholder: `"e.g., 5,000"`
- Helper: `"This is usually 10–14% of your basic salary. Check your payslip or ask HR."`

**Employee (own) NPS input:**
- `"How much do you invest in NPS yourself, per month? (₹)"`
- Placeholder: `"e.g., 3,000"`
- Helper: `"Your own contributions (up to ₹50,000/year) give you an extra deduction under Section 80CCD(1B) — only in the Old Regime."`

**Logic note for developer:**
- Employer NPS contribution (Section 80CCD(2)):
  - Old regime: `min(npsEmployerMonthly × 12, basicSalary × 0.10)` — capped at 10% of basic (we'll approximate basic as 40% of gross)
  - New regime: Same rule but cap is 14% of basic
  - This deduction is OVER AND ABOVE the 80C limit of ₹1.5L
- Employee NPS contribution (Section 80CCD(1B)):
  - Old regime only: `min(npsEmployeeMonthly × 12, 50000)`
  - New regime: NOT allowed
  - Also over and above the 80C cap

**FAQ:**

| Question | Answer |
|---|---|
| What is NPS? | National Pension System — a government-backed retirement scheme. You invest during your working years and get a pension after retirement. |
| Does NPS reduce my 80C limit? | Your own NPS contribution (80CCD(1B)) gives you an EXTRA ₹50,000 deduction beyond your ₹1.5L 80C limit. So you could save tax on up to ₹2L total (80C + NPS). |
| Is the employer NPS contribution part of my salary? | Your employer's NPS contribution is paid by them directly — it comes out of your CTC but is not in your take-home. It's tax-free up to 14% of basic under the New Regime. |

---

### 5.9 Wizard — Step 8: Other Income / Deductions

**Step number:** 8 of 9

**Question (displayed large):**
> "A couple more quick questions."

**This step covers two minor items:**

**Item 1: Savings account interest**
- `"Do you earn interest from a savings account or FD?"`
- Yes / No
- If Yes: `"Approximately how much interest do you earn per year? (₹)"`
- Placeholder: `"e.g., 4,500"`
- Helper: `"Under the Old Regime, savings interest up to ₹10,000/year is tax-free (Section 80TTA). For senior citizens, interest up to ₹50,000 is exempt (Section 80TTB)."`

**Item 2: Professional tax**
- Pre-filled with ₹2,400/year
- Text: `"Your company likely deducts professional tax of ₹2,400/year (₹200/month). We've added this automatically."`
- Small `"Edit"` link → allows user to change to 0 or another value
- Helper: `"Professional tax is deductible from your salary in both regimes."`

**Logic note for developer:**
- Professional tax is a deduction from gross salary before computing taxable income — applies in BOTH regimes
- Savings interest:
  - Old regime: Deduction under 80TTA: `min(savingsInterest, 10000)` — for age below 60
  - Old regime: 80TTB for senior citizens: `min(savingsInterest, 50000)`
  - New regime: No 80TTA/80TTB deduction. Savings interest is added to taxable income.

---

### 5.10 Wizard — Step 9: Age

**Step number:** 9 of 9

**Question (displayed large):**
> "How old are you?"

**Sub-text:**
> "This affects your basic tax exemption under the Old Regime."

**Input — Three-option selector:**
- `"Below 60 years"` → age = 'below60'
- `"60 to 79 years (Senior Citizen)"` → age = 'senior'
- `"80 years or above (Super Senior Citizen)"` → age = 'supersenior'

**Helper text after selection:**

| Selection | Helper text shown |
|---|---|
| Below 60 | `"Standard exemption limit applies: ₹2.5 lakh (Old Regime) / ₹4 lakh (New Regime)."` |
| Senior | `"You get a higher exemption of ₹3 lakh under the Old Regime. New Regime limit is ₹4 lakh (same for all ages)."` |
| Super Senior | `"You get the highest exemption of ₹5 lakh under the Old Regime. You are also exempt from Advance Tax."` |

**CTA button:** `"See My Results →"` — triggers computation and navigates to `/results`

---

## 6. Live Preview Panel Specification

**Location:** Right side of the screen (sticky), visible throughout all 9 wizard steps on desktop. On mobile, shown as a collapsible bottom sheet labeled `"Live Tax Estimate ▼"`.

**Updates:** Recalculates every time any input changes (debounced 300ms).

**Initial state (before Step 1 is filled):** Show placeholder card: `"Your live tax estimate will appear here as you answer the questions."`

**After Step 1 is filled, show:**

```
Estimated Gross Salary: ₹X,XX,XXX / year
─────────────────────────────────────────
                   OLD REGIME    NEW REGIME
Taxable Income:    ₹X,XX,XXX    ₹X,XX,XXX
Tax (before cess): ₹X,XX,XXX    ₹X,XX,XXX
Cess (4%):         ₹X,XXX       ₹X,XXX
─────────────────────────────────────────
Total Tax:         ₹X,XX,XXX    ₹X,XX,XXX
Monthly Tax:       ₹X,XXX       ₹X,XXX
─────────────────────────────────────────
You save: ₹X,XXX with [REGIME NAME]
```

**Slab breakdown (expandable section within the panel):**

Shown as two small tables side by side (or stacked on narrow screens), one per regime.

```
NEW REGIME — Slab Breakdown
Slab            Rate    Tax
Up to ₹4L       0%     ₹0
₹4L–₹8L         5%     ₹X
₹8L–₹12L        10%    ₹X
₹12L–₹16L       15%    ₹X
...
─────────────────────────────
Subtotal:               ₹X
Less 87A Rebate:       -₹X
Cess (4%):             +₹X
─────────────────────────────
Total Tax:              ₹X
```

**Deductions summary panel (shown below slabs):**

```
YOUR DEDUCTIONS SUMMARY
                        OLD REGIME    NEW REGIME
Standard Deduction:     ₹50,000      ₹75,000
HRA Exemption:          ₹X,XXX       —
Section 80C:            ₹1,50,000    —
Section 80D:            ₹X,XXX       —
Home Loan Interest:     ₹X,XXX       —
NPS 80CCD(1B):          ₹X,XXX       —
Employer NPS 80CCD(2):  ₹X,XXX       ₹X,XXX
Professional Tax:       ₹2,400       ₹2,400
─────────────────────────────────────────────
Total Deductions:       ₹X,XX,XXX    ₹X,XXX
```

---

## 7. Tax Logic and Calculation Engine

All logic must be implemented as pure functions with no side effects. Inputs come from the state object. Outputs are used by both the live preview and the results page.

---

### 7.1 Gross Salary Reconstruction

The user inputs their monthly take-home (net) salary. We must reconstruct an approximate gross salary.

**Formula:**

```
annualTakeHome = monthlyTakeHome × 12
grossSalary = annualTakeHome + (pfDeductedMonthly × 12) + professionalTax
```

**Rationale:**
- The user's take-home = gross salary − employee PF − professional tax − TDS
- We add back PF and professional tax to approximate gross
- TDS is the tax itself — we don't add it back (we're computing what tax should be, not what was deducted)
- This approximation is clearly labeled in the UI: "Estimated gross salary"

**Basic salary approximation (needed for HRA and NPS cap calculations):**
```
basicSalary = grossSalary × 0.40
```
This is the most common ratio used in Indian salary structures. It is an approximation; exact basic salary varies by employer.

---

### 7.2 New Regime Calculation

```
Step 1: grossIncome = annualTakeHome + (pfDeductedMonthly × 12) + professionalTax

Step 2: Deduct standard deduction
  standardDeduction_new = 75000
  
Step 3: Deduct professional tax
  profTax = professionalTax  // typically 2400
  
Step 4: Deduct employer NPS (80CCD(2))
  employerNPS_new = min(npsEmployerMonthly × 12, basicSalary × 0.14)
  
Step 5: Taxable income
  taxableIncome_new = grossIncome − standardDeduction_new − profTax − employerNPS_new
  taxableIncome_new = max(taxableIncome_new, 0)

Step 6: Apply new regime slabs (see Section 13)
  rawTax_new = applyNewRegimeSlabs(taxableIncome_new)

Step 7: Apply Section 87A rebate
  if taxableIncome_new <= 1200000:
    rebate_new = min(rawTax_new, 60000)
  else:
    rebate_new = applyMarginalRelief_new(taxableIncome_new, rawTax_new)

Step 8: Tax after rebate
  taxAfterRebate_new = rawTax_new − rebate_new

Step 9: Add cess
  cess_new = taxAfterRebate_new × 0.04
  
Step 10: Total tax
  totalTax_new = taxAfterRebate_new + cess_new
```

---

### 7.3 Old Regime Calculation

```
Step 1: grossIncome = annualTakeHome + (pfDeductedMonthly × 12) + professionalTax

Step 2: Deduct standard deduction
  standardDeduction_old = 50000

Step 3: Deduct professional tax
  profTax = professionalTax

Step 4: HRA exemption (see Section 7.4)
  hraExemption = computeHRAExemption()

Step 5: Total 80C
  total80C = (pfDeductedMonthly × 12) + investments80C + homeLoanPrincipal
  deduction80C = min(total80C, 150000)

Step 6: 80D
  deduction80D_self = min(healthInsuranceSelf, 25000)
  if parentsAreSenior:
    deduction80D_parents = min(healthInsuranceParents, 50000)
  else:
    deduction80D_parents = min(healthInsuranceParents, 25000)
  deduction80D = deduction80D_self + deduction80D_parents

Step 7: Home loan interest (Section 24(b))
  deduction24b = min(homeLoanInterest, 200000)

Step 8: NPS
  // Employee own contribution (80CCD(1B)) — capped at 50000, extra above 80C
  deduction80CCD1B = min(npsEmployeeMonthly × 12, 50000)
  // Employer contribution (80CCD(2)) — capped at 10% of basic under old regime
  employerNPS_old = min(npsEmployerMonthly × 12, basicSalary × 0.10)

Step 9: Savings interest deduction
  if age == 'supersenior' or age == 'senior':
    deduction80TTB = min(savingsInterest, 50000)
    deduction80TTA = 0
  else:
    deduction80TTA = min(savingsInterest, 10000)
    deduction80TTB = 0

Step 10: Taxable income
  totalDeductions_old = standardDeduction_old + profTax + hraExemption
    + deduction80C + deduction80D + deduction24b
    + deduction80CCD1B + employerNPS_old
    + deduction80TTA + deduction80TTB

  taxableIncome_old = grossIncome − totalDeductions_old
  taxableIncome_old = max(taxableIncome_old, 0)

Step 11: Apply old regime slabs (based on age — see Section 13)
  rawTax_old = applyOldRegimeSlabs(taxableIncome_old, age)

Step 12: Section 87A rebate (old regime)
  if taxableIncome_old <= 500000:
    rebate_old = min(rawTax_old, 12500)
  else:
    rebate_old = 0

Step 13: Tax after rebate
  taxAfterRebate_old = rawTax_old − rebate_old

Step 14: Cess
  cess_old = taxAfterRebate_old × 0.04

Step 15: Total tax
  totalTax_old = taxAfterRebate_old + cess_old
```

---

### 7.4 HRA Exemption Formula

**Applicable only under Old Regime. Returns 0 if user doesn't pay rent.**

```
If monthlyRent == 0: return 0

hraReceived = basicSalary × 0.50  // approximate; most employers pay 50% of basic as HRA

if city == 'metro':
  percentageOfBasic = basicSalary × 0.50
else:
  percentageOfBasic = basicSalary × 0.40

rentPaid_annual = monthlyRent × 12
excessRent = max(rentPaid_annual − (basicSalary × 0.10), 0)

hraExemption = min(hraReceived, percentageOfBasic, excessRent)
```

Note: HRA exemption cannot exceed the HRA actually received in the salary. Since we approximate HRA as 50% of basic, this is baked in.

---

### 7.5 Section 87A Rebate and Marginal Relief

**New Regime:**
- If `taxableIncome_new <= 1,200,000`: rebate = `min(rawTax_new, 60000)`
- If `taxableIncome_new > 1,200,000`: apply marginal relief

**Marginal Relief formula (New Regime):**
```
excessIncome = taxableIncome_new − 1200000
taxWithoutRelief = rawTax_new
maxTaxPayable = excessIncome  // tax cannot exceed the amount earned above ₹12L
if taxWithoutRelief > excessIncome:
  effectiveTax = excessIncome
else:
  effectiveTax = taxWithoutRelief
```

This prevents the cliff effect where earning ₹10 more pushes someone into paying ₹61,500 in tax.

**Old Regime:**
- If `taxableIncome_old <= 500,000`: rebate = `min(rawTax_old, 12500)`
- No marginal relief applies at the old regime ₹5L threshold (the cliff is much smaller there)

---

### 7.6 Cess

4% Health and Education Cess is applied on `taxAfterRebate` in both regimes. No cess if tax is zero.

---

### 7.7 Deduction Rules by Regime

| Deduction | Old Regime | New Regime |
|---|---|---|
| Standard Deduction | ₹50,000 | ₹75,000 |
| HRA (Section 10(13A)) | Yes — formula-based | No |
| Professional Tax | Yes | Yes |
| Section 80C (PF, ELSS, PPF, LIC, etc.) | Yes — up to ₹1,50,000 | No |
| Section 80D (Health Insurance) | Yes | No |
| Section 24(b) Home Loan Interest (self-occupied) | Yes — up to ₹2,00,000 | No |
| Section 80CCD(1B) — own NPS extra ₹50K | Yes | No |
| Section 80CCD(2) — employer NPS | Yes — up to 10% of basic | Yes — up to 14% of basic |
| Section 80TTA — savings interest (below 60) | Yes — up to ₹10,000 | No |
| Section 80TTB — savings interest (senior) | Yes — up to ₹50,000 | No |
| Section 87A Rebate | If taxable income ≤ ₹5L → ₹12,500 | If taxable income ≤ ₹12L → ₹60,000 |
| Cess | 4% | 4% |

---

## 8. Validation Rules

| Field | Rule |
|---|---|
| monthlyTakeHome | Required. Integer > 0. Warn if < 10,000 or > 1,000,000. |
| monthlyRent | Required if "I pay rent" selected. Integer ≥ 0. Cannot exceed monthlyTakeHome (warn, don't block). |
| pfDeductedMonthly | Required if PF = Yes. Integer ≥ 0. Cannot exceed 20,000/month (warn). |
| investments80C (each) | Optional. Integer ≥ 0. |
| healthInsuranceSelf | Optional. Integer ≥ 0. Warn if > 100,000/year (unusual). |
| healthInsuranceParents | Optional. Integer ≥ 0. |
| homeLoanInterest | Optional. Integer ≥ 0. Warn if > 500,000 (likely a data entry error). |
| homeLoanPrincipal | Optional. Integer ≥ 0. |
| npsEmployeeMonthly | Optional. Integer ≥ 0. |
| npsEmployerMonthly | Optional. Integer ≥ 0. |
| savingsInterest | Optional. Integer ≥ 0. |
| age | Required. Must be one of: 'below60', 'senior', 'supersenior'. |

**General rules:**
- No negative values accepted anywhere
- All values are integers (no decimals)
- Empty optional fields default to 0
- Validation errors are shown inline beneath the field, not in a modal
- "Next" button is disabled until the required fields for that step pass validation
- User can navigate Back at any time without losing entered data

---

## 9. Result Page Logic

**URL:** `/results`

**Page title (verdict):**

```
if totalTax_new < totalTax_old:
  winner = "New Regime"
  savings = totalTax_old − totalTax_new
  headline = "Go with the New Regime. You save ₹{savings} this year."
  
elif totalTax_old < totalTax_new:
  winner = "Old Regime"
  savings = totalTax_new − totalTax_old
  headline = "Go with the Old Regime. You save ₹{savings} this year."
  
else:
  headline = "Both regimes result in the same tax for you."
```

**Result Page Sections:**

**Section 1 — Verdict Banner**
Large, visually prominent banner at top. Background color coded (green for winner, neutral for tie). Shows headline + savings amount + a brief reason sentence.

Example reason sentences:
- "Your HRA and 80C deductions make the Old Regime more efficient for your income level."
- "With limited deductions, the New Regime's lower rates and higher rebate save you more."
- "Your income falls below ₹12.75L threshold, making the New Regime effectively zero-tax."

Reason logic:
```
if winner == 'New' and taxableIncome_new <= 1200000:
  reason = "Your income is below ₹12 lakh after standard deduction, so you pay zero tax under the New Regime."
elif winner == 'New':
  reason = "The New Regime's lower slab rates outweigh your deductions under the Old Regime."
elif winner == 'Old' and deduction24b > 0 and hraExemption > 0:
  reason = "Your home loan interest and HRA together reduce your taxable income significantly, making the Old Regime better."
elif winner == 'Old' and deduction24b > 0:
  reason = "Your home loan interest deduction makes the Old Regime more efficient."
elif winner == 'Old':
  reason = "Your investments and deductions reduce your taxable income enough to beat the New Regime's lower rates."
```

**Section 2 — Side-by-Side Comparison Table**

| Item | Old Regime | New Regime |
|---|---|---|
| Estimated Gross Salary | ₹X | ₹X |
| Standard Deduction | ₹50,000 | ₹75,000 |
| HRA Exemption | ₹X | — |
| Professional Tax | ₹2,400 | ₹2,400 |
| 80C Deductions | ₹X | — |
| 80D (Health Insurance) | ₹X | — |
| Home Loan Interest | ₹X | — |
| NPS 80CCD(1B) | ₹X | — |
| Employer NPS 80CCD(2) | ₹X | ₹X |
| 80TTA/80TTB | ₹X | — |
| **Total Deductions** | **₹X** | **₹X** |
| **Taxable Income** | **₹X** | **₹X** |

**Section 3 — Slab-by-Slab Tax Breakdown**

Two tables side by side (or stacked on mobile), one per regime.

Old Regime:

| Income Slab | Rate | Tax |
|---|---|---|
| Up to ₹2,50,000 | 0% | ₹0 |
| ₹2,50,001 – ₹5,00,000 | 5% | ₹X |
| ₹5,00,001 – ₹10,00,000 | 20% | ₹X |
| Above ₹10,00,000 | 30% | ₹X |
| **Subtotal** | | **₹X** |
| Less: 87A Rebate | | -₹X |
| Add: Cess (4%) | | +₹X |
| **Total Tax** | | **₹X** |
| Monthly TDS (approx.) | | ₹X |

New Regime: (same structure with new slabs)

Show only the slabs that are relevant to the user's income. If taxable income is ₹8L, don't show the ₹12L–₹16L slab row.

**Section 4 — Personalized Explanation**

Plain-language paragraph. See Section 10.

**Section 5 — Actionable Suggestions**

Numbered list of 2–4 suggestions. See Section 10.

**Section 6 — Recalculate CTA**
`"← Change my inputs"` button → navigates back to wizard with state preserved.

---

## 10. Personalized Suggestions Engine

Generate suggestions based on the user's specific input values. Show only relevant ones — do not show all suggestions to everyone.

**Suggestion logic:**

```
suggestions = []

// Suggestion 1: 80C under-utilization (Old Regime users)
if winner == 'Old' or totalTax_old < totalTax_new + 10000:
  total80C_used = (pfDeductedMonthly × 12) + investments80C + homeLoanPrincipal
  if total80C_used < 150000:
    gap = 150000 − total80C_used
    suggestions.push(
      "You haven't fully used your ₹1.5L Section 80C limit. 
       You have room for ₹{gap} more in ELSS, PPF, or life insurance premium. 
       This would reduce your taxable income further under the Old Regime."
    )

// Suggestion 2: NPS extra benefit
if deduction80CCD1B == 0 and winner == 'Old':
  suggestions.push(
    "You can invest up to ₹50,000/year in NPS (Section 80CCD(1B)) to get an 
     extra deduction over and above your ₹1.5L 80C limit. 
     At your income level, this could save you ₹{nps_saving} in tax."
  )
  // nps_saving = 50000 × marginalRate

// Suggestion 3: HRA — not claimed, paying rent
if monthlyRent > 0 and winner == 'New':
  suggestions.push(
    "You pay rent but the Old Regime's HRA benefit still isn't enough to beat the 
     New Regime for your income. This is normal for incomes below ₹15L with moderate rent."
  )

// Suggestion 4: Health insurance
if healthInsuranceSelf == 0:
  suggestions.push(
    "You don't have health insurance. Apart from the tax benefit under the Old Regime 
     (up to ₹25,000/year under Section 80D), health insurance protects you from large 
     medical bills. Consider getting a floater plan for your family."
  )

// Suggestion 5: Very close between regimes
if abs(totalTax_old − totalTax_new) < 5000:
  suggestions.push(
    "The difference between the two regimes for you is less than ₹5,000. 
     If you prefer simplicity and don't want to maintain investment proofs, 
     the New Regime is easier to manage."
  )

// Suggestion 6: Employer NPS for new regime users
if winner == 'New' and npsEmployerMonthly == 0:
  suggestions.push(
    "Ask your HR if they offer an NPS co-contribution option. 
     Under the New Regime, employer NPS contributions (up to 14% of basic) 
     reduce your taxable income and don't cost you anything extra."
  )
```

**Personalized explanation paragraph template:**

```
"Your estimated annual salary is ₹{grossSalary}. 
Under the Old Regime, your deductions total ₹{totalDeductions_old}, 
bringing your taxable income down to ₹{taxableIncome_old}. 
Under the New Regime, you get a flat ₹75,000 standard deduction and no other deductions, 
giving you a taxable income of ₹{taxableIncome_new}.

[IF OLD REGIME WINS]: Despite the higher slab rates in the Old Regime, 
your deductions reduce the tax base enough that it comes out ahead.
[IF NEW REGIME WINS]: The New Regime's lower rates 
{+ zero-tax rebate below ₹12L if applicable} work better for your income and investment profile.

The biggest factors in your calculation were: {top 2 deductions by value}."
```

---

## 11. Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1B4FD8` | CTA buttons, links, active states |
| `--color-primary-light` | `#EEF2FF` | Selected step background, info banners |
| `--color-success` | `#15803D` | Winner badge, positive savings |
| `--color-success-light` | `#DCFCE7` | Winner banner background |
| `--color-neutral-900` | `#111827` | Headings |
| `--color-neutral-600` | `#4B5563` | Body text, sub-headings |
| `--color-neutral-300` | `#D1D5DB` | Borders, dividers |
| `--color-neutral-100` | `#F3F4F6` | Page background, table alternating rows |
| `--color-white` | `#FFFFFF` | Cards, panels |
| `--color-warning` | `#B45309` | Validation warnings |

### Typography

- Font: Inter (Google Fonts) — fallback: system-ui, sans-serif
- Step question headline: 28px, weight 700, color `--color-neutral-900`
- Sub-text / helper: 14px, weight 400, color `--color-neutral-600`
- Input label: 14px, weight 600, color `--color-neutral-900`
- CTA button: 16px, weight 600
- Body text (FAQs, explanations): 15px, weight 400, line-height 1.6

### Components

**Progress indicator:**
- Nine dots (or a thin bar) at the top of the wizard
- Active step: filled circle in `--color-primary`
- Completed steps: checkmark or filled grey circle
- Upcoming: empty circle with grey border

**Input field:**
- Height: 52px
- Border: 1.5px solid `--color-neutral-300`
- Border-radius: 8px
- Focus: border color changes to `--color-primary`, subtle box-shadow
- Prefix (₹): left-aligned inside the field, greyed out
- Comma-formatted number displayed dynamically

**Option selector (Yes/No, Metro/Other, etc.):**
- Pill-style toggle buttons
- Width: equal, side by side
- Selected state: `--color-primary` background, white text
- Unselected: white background, `--color-neutral-300` border

**FAQ accordion:**
- Triggered by `"Got a question? See FAQs ▾"` collapsed label
- Smooth expand animation (max-height transition)
- Each FAQ item: question in medium weight, answer in normal weight below it
- Subtle divider between items

**CTA button:**
- Background: `--color-primary`
- Hover: slightly darker (`#1640B0`)
- Disabled: `--color-neutral-300` background, not clickable
- Border-radius: 8px
- Padding: 14px 32px

**Live preview panel:**
- Background: white
- Border: 1px solid `--color-neutral-300`
- Border-radius: 12px
- Sticky on desktop (CSS position: sticky, top: 24px)
- Shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Numbers update with a subtle fade animation when recalculated

### Spacing

- Section spacing: 32px between major sections
- Step question to input: 24px
- Input to helper text: 8px
- Helper text to FAQ: 20px
- Wizard card max-width: 640px (centered)
- Preview panel width: 360px on desktop

### Responsiveness

| Breakpoint | Layout |
|---|---|
| ≥ 1024px | Two-column: wizard left, preview right (sticky) |
| 768px–1023px | Single column, preview panel collapses to bottom sheet |
| < 768px | Single column, bottom sheet for preview |

---

## 12. FAQ Content per Step

See each step specification above. Each step has 3–5 FAQ items embedded in a collapsible section at the bottom. The FAQ section header reads: `"Common questions about this step ▾"`.

Do not show FAQs until the user has been on a step for at least 3 seconds, or has clicked into an input field, or has scrolled past the input. This prevents cognitive overload on fast users.

---

## 13. Tax Data Reference (FY 2025-26)

*Source: Income Tax Department of India (incometax.gov.in), ClearTax, Budget 2025 announcement.*

### New Regime Slabs (All ages — no age-based variation)

| Income Slab | Tax Rate |
|---|---|
| Up to ₹4,00,000 | 0% |
| ₹4,00,001 – ₹8,00,000 | 5% |
| ₹8,00,001 – ₹12,00,000 | 10% |
| ₹12,00,001 – ₹16,00,000 | 15% |
| ₹16,00,001 – ₹20,00,000 | 20% |
| ₹20,00,001 – ₹24,00,000 | 25% |
| Above ₹24,00,000 | 30% |

- Standard Deduction: ₹75,000 (salaried individuals)
- Section 87A Rebate: Up to ₹60,000 for taxable income ≤ ₹12,00,000
- Effective zero-tax limit for salaried: ₹12,75,000 gross (₹75K std deduction + ₹12L taxable)
- Cess: 4% on tax liability

### Old Regime Slabs — Below 60 Years

| Income Slab | Tax Rate |
|---|---|
| Up to ₹2,50,000 | 0% |
| ₹2,50,001 – ₹5,00,000 | 5% |
| ₹5,00,001 – ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

- Standard Deduction: ₹50,000
- Section 87A Rebate: Up to ₹12,500 for taxable income ≤ ₹5,00,000

### Old Regime Slabs — Senior Citizens (60–79 Years)

| Income Slab | Tax Rate |
|---|---|
| Up to ₹3,00,000 | 0% |
| ₹3,00,001 – ₹5,00,000 | 5% |
| ₹5,00,001 – ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

### Old Regime Slabs — Super Senior Citizens (80+ Years)

| Income Slab | Tax Rate |
|---|---|
| Up to ₹5,00,000 | 0% |
| ₹5,00,001 – ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

### Key Deduction Limits Summary

| Section | Description | Old Regime | New Regime |
|---|---|---|---|
| Standard Deduction | Salary | ₹50,000 | ₹75,000 |
| 80C | PF + ELSS + PPF + LIC + NSC + principal | Max ₹1,50,000 | Not allowed |
| 80CCD(1B) | Own NPS contribution | ₹50,000 extra | Not allowed |
| 80CCD(2) | Employer NPS | 10% of basic | 14% of basic |
| 80D | Health insurance self/family | ₹25,000 | Not allowed |
| 80D | Health insurance parents (non-senior) | ₹25,000 | Not allowed |
| 80D | Health insurance parents (senior) | ₹50,000 | Not allowed |
| Section 24(b) | Home loan interest (self-occupied) | ₹2,00,000 | Not allowed |
| HRA 10(13A) | House Rent Allowance | Formula-based | Not allowed |
| 80TTA | Savings interest (below 60) | ₹10,000 | Not allowed |
| 80TTB | Savings interest (senior citizen) | ₹50,000 | Not allowed |
| Professional Tax | Salary deduction | Actual (typically ₹2,400) | Actual (typically ₹2,400) |
| 87A Rebate | Tax rebate | ₹12,500 (income ≤ ₹5L) | ₹60,000 (income ≤ ₹12L) |
| Cess | Health & Education Cess | 4% | 4% |

---

## 14. Edge Cases

| Case | Handling |
|---|---|
| Taxable income = 0 after deductions | Total tax = 0 in both regimes. Show message: "Your deductions bring your taxable income to zero under the Old Regime." |
| Income slightly above ₹12L (new regime) | Apply marginal relief. Do not show a cliff-effect tax amount. |
| 80C total exceeds ₹1.5L | Cap at ₹1.5L. Show a message in the live panel: "Your 80C investments exceed the ₹1.5L limit. Excess amount (₹X) does not reduce tax further." |
| Rent entered but income too low for HRA | HRA exemption formula produces 0 if annualRent − 10% of basic is 0 or negative. Show ₹0 HRA in the breakdown. |
| Super senior citizen under new regime | Same slabs as everyone else under new regime — no age benefit. Clearly note this in the results. |
| Senior citizen with 80TTB | Apply ₹50,000 deduction instead of 80TTA ₹10,000. |
| PF entered but 80C total already ₹1.5L from other sources | PF still counts toward 80C pool. Pool is capped at ₹1.5L total. |
| Employer NPS cap exceeded | If user enters employer NPS that would exceed 14% of estimated basic, cap it and show a note. |
| Both deduction80C and homeLoanPrincipal push total above ₹1.5L | Apply the cap to the combined pool and show breakdown. |
| Zero take-home entered | Disable Next, show error: "Please enter a valid amount." |
| User skips optional steps | All skipped values default to 0. |
| monthlyRent > monthlyTakeHome | Show a warning: "Your rent seems higher than your take-home. Please double-check." Do not block calculation. |
| homeLoanInterest entered but city and rent also entered | Both are valid simultaneously (someone with a home loan who also pays rent, e.g., for a different city). Handle independently. |

---

## 15. Technical Implementation Notes

### Recommended Tech Stack
- **Framework:** React (with hooks) or plain HTML/JS
- **State management:** React useState / useReducer — no Redux needed
- **Styling:** Tailwind CSS or a custom CSS design token system
- **Routing:** React Router v6 (hash-based routes to keep it fully static)
- **Hosting:** Any static host — Vercel, Netlify, GitHub Pages, or S3

### Computation
- All calculations must be pure JavaScript functions, fully deterministic
- No server calls for calculation
- No analytics, no cookies, no local storage required (state lives in memory only)
- debounce live preview recalculation at 300ms to avoid jank

### Testing Requirements
- Unit tests for every calculation function
- Test cases must include:
  - Zero deductions, new regime, ₹8L gross → zero tax (87A rebate)
  - ₹12.75L gross salaried, new regime → zero tax
  - ₹12.9L gross, new regime → marginal relief applied correctly
  - ₹15L gross, full 80C + 80D + HRA (metro) → old regime wins
  - Super senior citizen, old regime → ₹5L exemption applied
  - PF + ELSS exceeding ₹1.5L → capped at ₹1.5L
  - Employer NPS under new regime → 14% cap applied

### Number Formatting
- All currency values displayed with Indian numbering system: ₹1,23,456 (not ₹123,456)
- Use `Intl.NumberFormat('en-IN')` in JavaScript
- Annual values shown as-is; monthly values = annual / 12 (rounded)

### Accessibility
- All inputs have associated `<label>` elements
- Focus states are visible
- Progress bar/dots have aria-label indicating current step
- Result page has proper heading hierarchy (h1 for verdict, h2 for sections)
- Color is not the sole indicator of state (icons + text used alongside color)

### Browser Support
- Chrome, Firefox, Safari, Edge — latest two major versions
- No IE11 support required

---

*End of PRD — Version 1.0*

*Tax data sourced from: Income Tax Department of India (incometax.gov.in), Budget 2025 announcement (pib.gov.in), ClearTax.in, and Bajaj Finserv for FY 2025-26 (AY 2026-27).*
