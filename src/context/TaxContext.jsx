import { createContext, useContext, useState } from 'react'

const defaultState = {
  monthlyTakeHome: null,
  city: null,
  monthlyRent: null,
  pfDeductedMonthly: null,
  epfMonthlyEmployer: null,
  investments80C: null,
  healthInsuranceSelf: null,
  healthInsuranceParents: null,
  parentsAreSenior: null,
  homeLoanInterest: null,
  homeLoanPrincipal: null,
  npsEmployeeMonthly: null,
  npsEmployerMonthly: null,
  savingsInterest: null,
  age: 'below60',
  professionalTax: 2400,
}

const TaxContext = createContext(null)

export function TaxProvider({ children }) {
  const [state, setState] = useState(defaultState)
  const update = (fields) => setState(prev => ({ ...prev, ...fields }))
  const reset = () => setState(defaultState)
  return (
    <TaxContext.Provider value={{ state, update, reset }}>
      {children}
    </TaxContext.Provider>
  )
}

export const useTax = () => useContext(TaxContext)
