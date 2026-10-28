// Customer Log in / Sign up page (route "/login").
// Two tabs share one form: "Log in" (email + password) and "Sign up" (+ name and phone).
// After success the customer goes to ?next=... (e.g. back to the cart) or to My Orders.
// Already logged in? It sends you straight to My Orders.

import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import { useCustomer } from '../context/customerContext'
import InputField from '../components/InputField'

const CustomerLogin = () => {
  const { customer, login, signup } = useCustomer()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Only allow going back to a page on this site
  const next = searchParams.get('next')?.startsWith('/') ? searchParams.get('next') : '/my-bookings'
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (customer) return <Navigate to={next} replace />

  const isSignup = mode === 'signup'

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      if (isSignup) await signup(form)
      else await login(form.email, form.password)
      navigate(next, { replace: true })
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-[70vh] items-center justify-center bg-secondary px-6 py-12'>
      <form onSubmit={handleSubmit} className='w-full max-w-sm rounded bg-white p-8 shadow'>
        <div className='mb-6 grid grid-cols-2 rounded bg-gray-100 p-1' role='tablist'>
          {[['login', 'Log in'], ['signup', 'Sign up']].map(([id, label]) => (
            <button
              key={id}
              type='button'
              role='tab'
              aria-selected={mode === id}
              onClick={() => { setMode(id); setError('') }}
              className={`rounded py-2 font-semibold transition ${mode === id ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {isSignup && (
          <InputField label='Full Name' name='name' value={form.name} onChange={handleChange} placeholder='Your name' required />
        )}
        <InputField label='Email' name='email' type='email' value={form.email} onChange={handleChange} placeholder='you@example.com' required />
        {isSignup && (
          <InputField label='Phone' name='phone' type='tel' value={form.phone} onChange={handleChange} placeholder='10-digit mobile number' required />
        )}

        {/* Password with an eye button to show / hide it */}
        <div className='mb-4'>
          <label htmlFor='password' className='block text-dark mb-2 font-semibold'>Password</label>
          <div className='relative'>
            <input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={isSignup ? 6 : undefined}
              required
              className='w-full px-4 py-2 pr-11 rounded border placeholder:text-xs'
            />
            <button
              type='button'
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-primary'
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {error && <p className='mb-4 text-sm text-red-600'>{error}</p>}
        <button type='submit' disabled={isLoading} className='w-full bg-primary px-8 py-3 rounded text-white font-semibold cursor-pointer disabled:opacity-60'>
          {isLoading ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
        </button>
        <p className='mt-4 text-center text-sm text-gray-600'>
          No account needed to order — <Link to='/restaurants' className='font-semibold text-primary'>order as a guest</Link>
        </p>
      </form>
    </div>
  )
}

export default CustomerLogin
