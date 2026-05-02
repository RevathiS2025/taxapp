# India Tax Calculator — Phased Execution Plan

**Source PRD:** `india-tax-calculator-prd.md`  
**Stack:** React + Tailwind CSS + React Router v6 (hash-based, fully static)  
**Hosting:** Any static host (Vercel, Netlify, GitHub Pages)

Each phase ends with a **runnable app** you can open in a browser and decide whether to continue.

---

## Phase 1 — Foundation: Project Scaffold + Landing Page

**What you'll see at the end:** A polished landing page. You can read the headline, see the sample result card, and click "Find Out Now" (takes you to a placeholder).

### Tasks

- Scaffold a new React app (Vite recommended)
- Install and configure Tailwind CSS with the design tokens from PRD §11 (colors, fonts, spacing)
- Install React Router v6; define three routes: `/`, `/calculator`, `/results`
- Build the landing page (PRD §5.1):
  - Two-column desktop layout (60/40 split); single-column on mobile
  - Headline, sub-headline, three trust badges, CTA button, "No sign-up" note
  - Right column: static sample result card with a "Sample Result" watermark
  - Off-white/light blue-grey hero background with a subtle gradient element
- `/calculator` and `/results` routes render a simple "Coming soon" placeholder

### Done when

You can open `/` in a browser and it looks like a real product, not a blank form.

---

## Phase 2 — Core Engine: Tax Logic + Step 1 + Live Preview + Basic Results

**What you'll see at the end:** Enter your monthly take-home salary → a live Old vs New tax estimate appears on the right → click through to a results page with a verdict and a savings amount.

### Tasks

**Tax calculation engine (pure JS functions — no UI):**
- `reconstructGross(state)` — take-home → gross salary, basic salary approximation
- `applyNewRegimeSlabs(taxableIncome)` — FY 2025-26 new slabs (PRD §13)
- `applyOldRegimeSlabs(taxableIncome, age)` — three slab tables by age group
- `computeHRAExemption(state)` — three-part min formula (PRD §7.4)
- `applyMarginalRelief(taxableIncome, rawTax)` — new regime cliff prevention (PRD §7.5)
- `computeNewRegime(state)` — full new regime pipeline (PRD §7.2)
- `computeOldRegime(state)` — full old regime pipeline (PRD §7.3)
- `formatINR(number)` — Indian numbering system using `Intl.NumberFormat('en-IN')`
- Unit tests for the 7 required test cases listed in PRD §15

**App state:**
- Create the shared state object (PRD §4) with all fields defaulted to `null` or `0`
- Wire up React state (useState or context) accessible to wizard and results

**Wizard — Step 1 (PRD §5.2):**
- Full-screen wizard card (max-width 640px, centered)
- Nine-dot progress indicator at top (step 1 of 9 active)
- ₹ prefixed currency input with placeholder and sub-text
- Validation: required, warn below ₹10K, warn above ₹10L
- "Next →" button (disabled until valid)

**Live preview panel (basic version):**
- Right-side sticky panel on desktop
- Shows: Estimated Gross, Taxable Income (Old/New), Tax before cess, Cess, Total Tax, Monthly Tax, "You save ₹X with [Regime]"
- Placeholder card shown until Step 1 is filled
- Recalculates on every state change (debounce 300ms)

**Results page (basic version):**
- Verdict banner: headline sentence (winner + savings amount)
- Simple two-column table: Gross, Standard Deduction, Taxable Income, Total Tax
- "← Change my inputs" button navigates back to wizard with state preserved

### Done when

You can type a salary, see numbers update in the preview panel in real time, click "See Results", and read a verdict.

---

## Phase 3 — Wizard Steps 2–5: Rent, PF, 80C, Health Insurance

**What you'll see at the end:** Four more steps of the wizard are functional. The live preview updates meaningfully — entering rent or PF visibly shifts the Old Regime number.

### Tasks

**Step 2 — City and Rent (PRD §5.3):**
- "I pay rent" / "I own / live rent-free" pill selector
- Conditional: monthly rent input + Metro / Other city toggle
- HRA exemption immediately reflected in live preview Old Regime number

**Step 3 — Provident Fund (PRD §5.4):**
- Yes / No pill selector
- Conditional: monthly PF amount input with "Not sure?" helper showing 12% calculation
- Both employee and employer contributions wired into state and 80C pool

**Step 4 — 80C Investments (PRD §5.5):**
- Checklist of 7 investment types; each checkbox reveals an amount input
- Running total display below the list: "80C excluding PF: ₹X | Combined: ₹Y | Effective: ₹Z (capped at ₹1,50,000)"
- Live preview shows 80C deduction capped correctly

**Step 5 — Health Insurance (PRD §5.6):**
- Yes / No selector
- Conditional: self+spouse+children premium input
- Conditional: parents toggle → parents premium input → senior citizen toggle
- 80D deduction (old regime only) reflected in live preview

**Progress indicator:**
- Dots 2–5 correctly reflect visited/active/upcoming states

### Done when

Steps 1–5 are fully navigable, state persists through Back/Next, and the live preview reflects all entered values.

---

## Phase 4 — Wizard Steps 6–9: Home Loan, NPS, Other, Age

**What you'll see at the end:** The complete 9-step wizard. You can go from landing page through all steps to a results page — full end-to-end flow.

### Tasks

**Step 6 — Home Loan (PRD §5.7):**
- Yes / No selector
- Conditional: annual interest input (Section 24(b), capped at ₹2L) + annual principal input (goes into 80C pool)

**Step 7 — NPS (PRD §5.8):**
- Four-option selector: Employer only / Self only / Both / None
- Employer NPS input (80CCD(2) — 10% of basic old, 14% of basic new)
- Employee NPS input (80CCD(1B) — extra ₹50K, old regime only)
- Both deductions appear in live preview, correctly regime-segregated

**Step 8 — Other Income / Deductions (PRD §5.9):**
- Savings interest toggle + annual amount input
- 80TTA / 80TTB applied by age in old regime
- Professional tax pre-filled at ₹2,400 with an "Edit" escape hatch

**Step 9 — Age (PRD §5.10):**
- Three-option selector: Below 60 / Senior (60–79) / Super Senior (80+)
- Contextual helper text per selection
- "See My Results →" CTA triggers computation and navigates to `/results`

**Edge cases in the engine:**
- 80C pool overflow message in live panel when combined PF + investments + principal > ₹1.5L
- Employer NPS cap: if entered value would exceed 14% of basic, cap it and show a note
- Marginal relief at ₹12L boundary in new regime (already built in Phase 2, now exercised with real data)
- Taxable income floored at 0

### Done when

A user can complete all 9 steps and land on the results page with a correct verdict.

---

## Phase 5 — Full Results Page

**What you'll see at the end:** The results page becomes genuinely useful — not just a verdict number, but a clear explanation of why, a full breakdown, and 2–4 personalised suggestions.

### Tasks

**Verdict banner (PRD §9):**
- Color-coded: green background for New Regime win, blue for Old Regime win, neutral for tie
- Large headline with winner name and savings amount in Indian formatting
- Reason sentence generated by the 5-branch logic (PRD §9)

**Section 2 — Full side-by-side comparison table:**
- All deduction line items: Standard Deduction, HRA, Professional Tax, 80C, 80D, Home Loan Interest, NPS 80CCD(1B), Employer NPS 80CCD(2), 80TTA/80TTB
- Show "—" for deductions not available in a given regime
- Bold rows for Total Deductions and Taxable Income

**Section 3 — Slab-by-slab tax breakdown (PRD §9):**
- Two tables side by side (stacked on mobile): Old Regime and New Regime
- Show only slabs relevant to the user's taxable income
- Footer rows: Subtotal, Less 87A Rebate, Add Cess (4%), Total Tax, Monthly TDS (approx.)

**Section 4 — Personalized explanation paragraph (PRD §10):**
- Template-based paragraph: gross salary, total deductions (old/new), taxable income (old/new), winner reason, top 2 deductions by value

**Section 5 — Actionable suggestions (PRD §10):**
- Run all 6 suggestion conditions; surface only the relevant 2–4
- Show as a numbered list with specific rupee amounts where applicable

**Section 6 — Recalculate CTA:**
- "← Change my inputs" navigates back to `/calculator` with full state preserved

### Done when

The results page tells a clear story: here's what you earn, here's why one regime wins, here's what you should do next.

---

## Phase 6 — Enhanced Live Preview + Step FAQs

**What you'll see at the end:** The live panel is fully detailed; each wizard step has collapsible contextual help.

### Tasks

**Enhanced live preview (PRD §6):**
- Expandable slab breakdown section within the panel — two mini-tables (Old and New), showing each slab's tax amount
- Deductions summary panel below slabs — line-by-line for both regimes

**FAQ accordions on all 9 steps (PRD §12):**
- Each step has a "Common questions about this step ▾" collapsed label
- 3–5 FAQ items per step with Q&A content from the PRD
- Smooth max-height CSS transition for expand/collapse
- FAQ section only appears after 3 seconds on the step, OR after the user clicks an input field, OR after scrolling past the input — whichever comes first

**Live preview animation:**
- Numbers in the panel update with a subtle fade/transition (CSS opacity + transition, triggered on recalculation)

### Done when

The live panel feels dynamic and informative; the FAQs help confused users without overwhelming fast ones.

---

## Phase 7 — Validation, Mobile, Accessibility, Polish

**What you'll see at the end:** A production-quality app. Works on mobile, correctly rejects bad input, accessible to screen readers, numbers formatted correctly throughout.

### Tasks

**Validation (PRD §8):**
- All inline validation rules: required fields, range warnings, cross-field warnings (rent > take-home, PF > ₹20K/month, home loan interest > ₹5L)
- "Next" button disabled until required fields for that step pass validation
- Errors shown inline below the field, never in a modal
- Back navigation never loses entered data

**Indian number formatting throughout:**
- All currency inputs display comma-formatted numbers as the user types (e.g., `65,000` not `65000`)
- All output values use Indian system: `₹1,23,456` not `₹123,456`
- `Intl.NumberFormat('en-IN')` used consistently

**Mobile responsiveness (PRD §11):**
- Live preview collapses to a bottom sheet on screens < 1024px, labeled "Live Tax Estimate ▼"
- Wizard card, buttons, and inputs scale correctly on small screens
- Results page tables stack vertically on mobile

**Accessibility (PRD §15):**
- All inputs have associated `<label>` elements
- Progress indicator has `aria-label` ("Step 3 of 9")
- Results page heading hierarchy: `<h1>` for verdict, `<h2>` for each section
- Focus states are visible and keyboard-navigable
- Color is never the sole state indicator (icons + text alongside color)

**Final browser check:**
- Smoke test in Chrome, Firefox, Safari, Edge (latest two versions)
- Verify all edge cases from PRD §14 produce correct output and correct UI messages

### Done when

The app is ready to share publicly. No rough edges; no broken flows on any device or viewport.

---

## Summary

| Phase | What ships | End state |
|---|---|---|
| 1 | Scaffold + Landing Page | See the landing page |
| 2 | Tax engine + Step 1 + Live preview + Basic results | Enter salary → see live estimate → verdict |
| 3 | Wizard Steps 2–5 | Rent, PF, 80C, health insurance feeding live preview |
| 4 | Wizard Steps 6–9 | Complete end-to-end wizard flow |
| 5 | Full results page | Rich verdict, breakdown tables, suggestions |
| 6 | Enhanced live preview + FAQs | Detailed panel, contextual help per step |
| 7 | Validation, mobile, accessibility, polish | Production-ready |
