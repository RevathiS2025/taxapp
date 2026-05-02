# India Salary Tax Calculator — FY 2025-26

Compare Old Regime vs New Regime tax in under 2 minutes. Enter your monthly take-home salary, answer a few plain-language questions, and get a clear verdict with the exact amount you save.

**100% client-side — no data ever leaves your browser.**

---

## Features

- 9-step guided wizard starting from monthly take-home (not CTC)
- Live tax estimate that updates as you type
- Side-by-side slab-by-slab breakdown for both regimes
- Personalized suggestions (80C gaps, NPS opportunities, health insurance)
- Mobile-optimized with a sticky bottom estimate sheet
- Supports all age groups: below 60, senior citizen (60–79), super senior (80+)
- Covers HRA, 80C, 80D, home loan, NPS, professional tax, Section 87A rebate with marginal relief

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18.3.1 |
| Routing | React Router DOM 6.26.2 |
| Build Tool | Vite 5.4.10 |
| Styling | Tailwind CSS 3.4.14 |
| State Management | React Context API |
| Tax Engine | Pure JavaScript (no external libraries) |
| Number Formatting | `Intl.NumberFormat('en-IN')` |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── main.jsx                  # App entry point
├── App.jsx                   # Routes: / | /calculator | /results
├── context/
│   └── TaxContext.jsx        # Global state for all form inputs
├── engine/
│   └── taxEngine.js          # Pure JS tax calculation functions
├── pages/
│   ├── LandingPage.jsx
│   ├── CalculatorPage.jsx    # 9-step wizard
│   └── ResultsPage.jsx       # Comparison + verdict
└── components/
    ├── LivePreview.jsx        # Real-time tax estimate panel
    ├── MobileEstimateSheet.jsx # Sticky bottom sheet for mobile
    ├── CurrencyInput.jsx
    ├── PillButton.jsx
    ├── ProgressDots.jsx
    ├── StepNav.jsx
    ├── FaqAccordion.jsx
    └── wizard/
        ├── Step1.jsx          # Monthly take-home
        ├── Step2.jsx          # City & rent (HRA)
        ├── Step3.jsx          # Provident Fund
        ├── Step4.jsx          # 80C investments
        ├── Step5.jsx          # Health insurance (80D)
        ├── Step6.jsx          # Home loan
        ├── Step7.jsx          # NPS
        ├── Step8.jsx          # Other income / professional tax
        └── Step9.jsx          # Age
```

---

## Tax Rules Implemented (FY 2025-26)

- **New Regime slabs**: 0% up to ₹4L, then 5/10/15/20/25/30%
- **Old Regime slabs**: Age-based (below 60 / senior / super senior)
- **Standard Deduction**: ₹75,000 (New) / ₹50,000 (Old)
- **Section 87A Rebate**: ₹60,000 for taxable income ≤ ₹12L (New) / ₹12,500 for ≤ ₹5L (Old)
- **Marginal Relief** on the ₹12L threshold (New Regime)
- **HRA Exemption** (Old Regime only) — metro vs non-metro formula
- **80C** cap at ₹1,50,000 (PF + ELSS + PPF + LIC + home loan principal + others)
- **80D** health insurance — self (₹25K) + parents (₹25K / ₹50K if senior)
- **Section 24(b)** home loan interest — up to ₹2,00,000 (Old Regime)
- **80CCD(1B)** own NPS — up to ₹50,000 extra (Old Regime)
- **80CCD(2)** employer NPS — 10% of basic (Old) / 14% of basic (New)
- **80TTA / 80TTB** savings interest deduction
- **4% Health & Education Cess** on final tax

---

## Scope

**In scope:** Salaried individuals, single employer, FY 2025-26 (AY 2026-27)

**Out of scope:** Capital gains, freelance/business income, surcharge above ₹50L, NRI taxation, rental income as primary income, PDF export

---

## Deployment

The app is a fully static build — deploy anywhere:

```bash
npm run build   # outputs to dist/
```

Compatible with Vercel, Netlify, GitHub Pages, or any static host.
