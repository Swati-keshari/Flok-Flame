// Admin panel (route "/admin"). Only works when logged in.
// - Checks the saved token with /api/auth/me; if it is invalid, goes back to the login page.
// - Tabs: Dashboard (sales numbers), Food Orders, Table Bookings, Restaurants (+ menus), Messages, Subscribers.
// Each tab gets onUnauthorized (= logout) to call if the session expires.
// New-order alert: every 20 s it asks /api/stats how many orders wait to be accepted.
// When that number goes up it plays a short "ding" (if sound is on), puts
// "(N) New order!" in the browser tab title and shows a red badge on "Food Orders".

import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getJSON, getToken, setToken } from '../../api'
import DashboardTab from '../../components/admin/DashboardTab'
import OrdersTab from '../../components/admin/OrdersTab'
import BookingsTab from '../../components/admin/BookingsTab'
import RestaurantsTab from '../../components/admin/RestaurantsTab'
import MessagesTab from '../../components/admin/MessagesTab'
import SubscribersTab from '../../components/admin/SubscribersTab'
import CouponsTab from '../../components/admin/CouponsTab'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', Component: DashboardTab },
  { id: 'orders', label: 'Food Orders', Component: OrdersTab },
  { id: 'bookings', label: 'Table Bookings', Component: BookingsTab },
  { id: 'restaurants', label: 'Restaurants', Component: RestaurantsTab },
  { id: 'coupons', label: 'Coupons', Component: CouponsTab },
  { id: 'messages', label: 'Messages', Component: MessagesTab },
  { id: 'subscribers', label: 'Subscribers', Component: SubscribersTab },
]

const POLL_MS = 20000
const SOUND_KEY = 'adminSound'

const loadSoundSetting = () => {
  try { return localStorage.getItem(SOUND_KEY) !== 'off' } catch { return true }
}

// A short two-tone "ding" made with the Web Audio API (no sound file needed)
let audioContext = null
const playDing = () => {
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)()
    audioContext.resume()
    const start = audioContext.currentTime
    ;[880, 1320].forEach((freq, i) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = start + i * 0.18
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
      osc.connect(gain).connect(audioContext.destination)
      osc.start(t)
      osc.stop(t + 0.4)
    })
  } catch { /* sound not available in this browser */ }
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const hasToken = Boolean(getToken())
  const [newOrders, setNewOrders] = useState(0)
  const [soundOn, setSoundOn] = useState(loadSoundSetting)
  const soundOnRef = useRef(soundOn)
  const lastCount = useRef(null) // null = no poll yet, so the first poll never dings

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    soundOnRef.current = next
    try { localStorage.setItem(SOUND_KEY, next ? 'on' : 'off') } catch { /* storage unavailable */ }
    if (next) playDing() // a test ding (also lets the browser allow sound later)
  }

  const checkNewOrders = useCallback(() => {
    getJSON('/api/stats')
      .then((stats) => {
        const count = stats.needsAttention.newOrders
        if (lastCount.current !== null && count > lastCount.current && soundOnRef.current) playDing()
        lastCount.current = count
        setNewOrders(count)
      })
      .catch(() => { /* the open tab shows its own errors; try again next time */ })
  }, [])

  // Poll for new orders while the admin panel is open (on every tab)
  useEffect(() => {
    if (!admin) return
    checkNewOrders()
    const timer = setInterval(checkNewOrders, POLL_MS)
    return () => clearInterval(timer)
  }, [admin, checkNewOrders])

  // "(2) New order! – Fork & Flame" in the browser tab while orders wait
  useEffect(() => {
    const original = document.title
    if (newOrders > 0) document.title = `(${newOrders}) New order! – Fork & Flame`
    return () => { document.title = original }
  }, [newOrders])

  const logout = () => {
    setToken(null)
    navigate('/admin/login', { replace: true })
  }

  // Having a token in the browser isn't enough: ask the server if it is still valid
  // (tokens expire after 7 days). If not, forget it and go to the login page.
  useEffect(() => {
    if (!hasToken) return
    getJSON('/api/auth/me')
      .then(setAdmin)
      .catch(() => {
        setToken(null)
        navigate('/admin/login', { replace: true })
      })
  }, [hasToken, navigate])

  if (!hasToken) return <Navigate to='/admin/login' replace />
  if (!admin) return <p className='py-20 text-center text-gray-700'>Loading...</p>

  const { Component } = tabs.find((t) => t.id === activeTab)

  return (
    <div className='min-h-screen bg-secondary py-10'>
      <div className='container mx-auto px-6'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-dark'>Admin Panel</h1>
            <p className='text-sm text-gray-600'>Logged in as {admin.email}</p>
          </div>
          <div className='flex flex-wrap gap-3 self-start'>
            <button
              type='button'
              onClick={toggleSound}
              aria-pressed={soundOn}
              title='Play a sound when a new order arrives'
              className='rounded border border-gray-400 px-4 py-2 font-semibold text-dark hover:border-dark'
            >
              {soundOn ? '🔔 Sound on' : '🔕 Sound off'}
            </button>
            <button type='button' onClick={logout} className='rounded border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary hover:text-white transition'>
              Log out
            </button>
          </div>
        </div>

        <div className='mb-6 flex gap-2 overflow-x-auto border-b border-gray-300' role='tablist'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type='button'
              role='tab'
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-2 font-semibold transition ${
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-dark'
              }`}
            >
              {tab.label}
              {tab.id === 'orders' && newOrders > 0 && (
                <span className='ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white' aria-label={`${newOrders} new`}>
                  {newOrders}
                </span>
              )}
            </button>
          ))}
        </div>

        <Component onUnauthorized={logout} onOpenTab={setActiveTab} />
      </div>
    </div>
  )
}

export default AdminDashboard
