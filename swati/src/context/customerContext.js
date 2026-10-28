// Creates the CustomerContext and the useCustomer() hook.
// Any component can call useCustomer() to know who is logged in and to log in / out.
// The logic lives in CustomerProvider.jsx (separate file for React Fast Refresh, like the cart).

import { createContext, useContext } from 'react'

export const CustomerContext = createContext(null)

export const useCustomer = () => {
  const value = useContext(CustomerContext)
  if (!value) throw new Error('useCustomer must be used inside <CustomerProvider>')
  return value
}
