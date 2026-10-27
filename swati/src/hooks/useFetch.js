// useFetch(path, params): loads data from the backend with GET and keeps it in state.
// Returns { data, error, isLoading, reload, setData }.
// - It refetches automatically when path or params change, or when reload() is called.
// - setData lets a page update the list locally after an action (no full reload needed).
// useAdminFetch(): same, but logs the admin out when the server says 401 (session expired).

import { useCallback, useEffect, useState } from 'react'
import { getJSON } from '../api'

// GETs `path` with `params`; refetches when they change or when reload() is called.
// Results are stored with the request they belong to, so isLoading needs no extra state.
const useFetch = (path, params = {}) => {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState({ key: null, data: null, error: null })
  const key = JSON.stringify([path, params, version])

  useEffect(() => {
    let ignore = false
    const [p, query] = JSON.parse(key)
    getJSON(p, query)
      .then((data) => !ignore && setResult({ key, data, error: null }))
      .catch((error) => !ignore && setResult({ key, data: null, error }))
    return () => { ignore = true }
  }, [key])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const isLoading = result.key !== key

  return { data: result.data, error: result.error, isLoading, reload, setData: (updater) =>
    setResult((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater })) }
}

// Same as useFetch, but calls onUnauthorized() when the admin session is no longer valid
export const useAdminFetch = (path, params, onUnauthorized) => {
  const result = useFetch(path, params)
  const status = result.error?.status
  useEffect(() => {
    if (status === 401) onUnauthorized?.()
  }, [status, onUnauthorized])
  return result
}

export default useFetch
