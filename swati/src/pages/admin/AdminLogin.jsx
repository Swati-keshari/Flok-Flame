// Admin login page (route "/admin/login").
// Sends email + password to /api/auth/login. On success the server returns a token,
// which we save (setToken) and then open the admin panel.
// Admins are created from the backend folder: npm run create-admin -- <email> <password>

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import { getToken, postJSON, setToken } from '../../api'
import InputField from '../../components/InputField'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (getToken()) return <Navigate to='/admin' replace />

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { token } = await postJSON('/api/auth/login', form)
      setToken(token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-[70vh] items-center justify-center bg-secondary px-6 py-12'>
      <form onSubmit={handleSubmit} className='w-full max-w-sm rounded bg-white p-8 shadow'>
        <h1 className='mb-6 text-center text-2xl font-bold text-dark'>Admin Login</h1>
        <InputField label='Email' name='email' type='email' value={form.email} onChange={handleChange} placeholder='admin@example.com' required />
        {/* Password box with an eye button to show / hide what was typed */}
        <div className='mb-4'>
          <label htmlFor='password' className='block text-dark mb-2 font-semibold'>Password</label>
          <div className='relative'>
            <input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder='Your password'
              autoComplete='current-password'
              required
              className='w-full px-4 py-2 pr-11 rounded border placeholder:text-xs'
            />
            <button
              type='button'
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-primary'
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {error && <p className='mb-4 text-sm text-red-600'>{error}</p>}
        <button type='submit' disabled={isLoading} className='w-full bg-primary px-8 py-3 rounded text-white font-semibold cursor-pointer disabled:opacity-60'>
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  )
}

export default AdminLogin
