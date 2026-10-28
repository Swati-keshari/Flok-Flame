// CustomerProvider: the logged-in customer for the whole app (wrapped around everything in App.jsx).
// Gives (through useCustomer()):
//   customer  → { id, name, email, phone } or null when logged out
//   login(email, password), signup({ name, email, phone, password }), logout()
// The token and profile are kept in localStorage so the customer stays logged in after a refresh.
// On start, the saved token is checked with the server; if it has expired, the customer is logged out.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CustomerContext } from './customerContext'
import { getCustomerToken, getJSON, postJSON, setCustomerToken } from '../api'

const PROFILE_KEY = 'customerProfile'

const loadProfile = () => {
  if (!getCustomerToken()) return null
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) } catch { return null }
}
const saveProfile = (profile) => {
  try {
    if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    else localStorage.removeItem(PROFILE_KEY)
  } catch { /* storage unavailable */ }
}

const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(loadProfile)

  const setSession = useCallback((token, profile) => {
    setCustomerToken(token)
    saveProfile(profile)
    setCustomer(profile)
  }, [])

  const logout = useCallback(() => setSession(null, null), [setSession])

  // Check the saved login once when the site opens
  useEffect(() => {
    if (!getCustomerToken()) return
    getJSON('/api/customers/me')
      .then((profile) => { saveProfile(profile); setCustomer(profile) })
      .catch((err) => { if (err.status === 401) logout() })
  }, [logout])

  const value = useMemo(() => ({
    customer,
    login: async (email, password) => {
      const { token, customer: profile } = await postJSON('/api/customers/login', { email, password })
      setSession(token, profile)
      return profile
    },
    signup: async (details) => {
      const { token, customer: profile } = await postJSON('/api/customers/signup', details)
      setSession(token, profile)
      return profile
    },
    logout,
  }), [customer, setSession, logout])

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}

export default CustomerProvider
