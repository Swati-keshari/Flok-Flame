// Admin panel (route "/admin"). Only works when logged in.
// - Checks the saved token with /api/auth/me; if it is invalid, goes back to the login page.
// - Tabs: Dashboard (sales numbers), Food Orders, Table Bookings, Restaurants (+ menus), Messages, Subscribers.
// Each tab gets onUnauthorized (= logout) to call if the session expires.

import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getJSON, getToken, setToken } from '../../api'
import DashboardTab from '../../components/admin/DashboardTab'
import OrdersTab from '../../components/admin/OrdersTab'
import BookingsTab from '../../components/admin/BookingsTab'
import RestaurantsTab from '../../components/admin/RestaurantsTab'
import MessagesTab from '../../components/admin/MessagesTab'
import SubscribersTab from '../../components/admin/SubscribersTab'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', Component: DashboardTab },
  { id: 'orders', label: 'Food Orders', Component: OrdersTab },
  { id: 'bookings', label: 'Table Bookings', Component: BookingsTab },
  { id: 'restaurants', label: 'Restaurants', Component: RestaurantsTab },
  { id: 'messages', label: 'Messages', Component: MessagesTab },
  { id: 'subscribers', label: 'Subscribers', Component: SubscribersTab },
]

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const hasToken = Boolean(getToken())

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
          <button type='button' onClick={logout} className='self-start rounded border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary hover:text-white transition'>
            Log out
          </button>
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
            </button>
          ))}
        </div>

        <Component onUnauthorized={logout} onOpenTab={setActiveTab} />
      </div>
    </div>
  )
}

export default AdminDashboard
