// Admin → Coupons tab: discount codes customers type at checkout (e.g. FIRST50).
// Create a coupon, switch it on/off, delete it, and see how often each was used.
// Prop: onUnauthorized (log out if the session expired).
// The checkout bill applies coupons on the server (routes/orders.js), never here.

import { useState } from 'react'
import { deleteJSON, postJSON, putJSON } from '../../api'
import { useAdminFetch } from '../../hooks/useFetch'
import InputField from '../InputField'

const emptyForm = { code: '', description: '', type: 'flat', value: '', minOrder: '0', maxDiscount: '0', firstOrderOnly: false }

const rupees = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

// "₹50 off" or "20% off, max ₹150"
const offerText = (c) =>
  c.type === 'percent' ? `${c.value}% off${c.maxDiscount > 0 ? `, max ${rupees(c.maxDiscount)}` : ''}` : `${rupees(c.value)} off`

const CouponsTab = ({ onUnauthorized }) => {
  const { data: coupons, error, isLoading, setData, reload } = useAdminFetch('/api/coupons', undefined, onUnauthorized)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const handleError = (err) => {
    if (err.status === 401) return onUnauthorized()
    setActionError(err.message)
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : name === 'code' ? value.toUpperCase().replace(/[^A-Z0-9]/g, '') : value }))
  }

  const create = async (event) => {
    event.preventDefault()
    setActionError('')
    try {
      await postJSON('/api/coupons', {
        ...form,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxDiscount: form.type === 'percent' ? Number(form.maxDiscount) || 0 : 0,
      })
      setForm(emptyForm)
      setShowForm(false)
      reload()
    } catch (err) {
      handleError(err)
    }
  }

  const toggle = async (coupon) => {
    setActionError('')
    setBusyId(coupon._id)
    try {
      const updated = await putJSON(`/api/coupons/${coupon._id}`, { active: !coupon.active })
      // keep the usage numbers the list already has
      setData((prev) => prev.map((c) => (c._id === updated._id ? { ...c, active: updated.active } : c)))
    } catch (err) {
      handleError(err)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}? Customers won't be able to use it any more.`)) return
    setActionError('')
    try {
      await deleteJSON(`/api/coupons/${coupon._id}`)
      setData((prev) => prev.filter((c) => c._id !== coupon._id))
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <div>
      {showForm ? (
        <form onSubmit={create} className='mb-6 rounded-lg bg-white p-6 shadow'>
          <h2 className='mb-4 text-xl font-bold text-dark'>New coupon</h2>
          <div className='grid grid-cols-1 gap-x-6 md:grid-cols-2'>
            <InputField label='Code (3-20 letters / numbers)' name='code' value={form.code} onChange={handleChange} placeholder='DIWALI100' required />
            <InputField label='Description (shown to you)' name='description' value={form.description} onChange={handleChange} placeholder='Diwali offer' />
            <div className='mb-4'>
              <label htmlFor='type' className='block text-dark mb-2 font-semibold'>Discount type</label>
              <select id='type' name='type' value={form.type} onChange={handleChange} className='w-full px-4 py-2 rounded border bg-white'>
                <option value='flat'>Flat ₹ off</option>
                <option value='percent'>% off</option>
              </select>
            </div>
            <InputField label={form.type === 'percent' ? 'Percent off (1-90)' : 'Rupees off'} name='value' type='number' value={form.value} onChange={handleChange} minValue='1' required />
            <InputField label='Minimum item total (₹)' name='minOrder' type='number' value={form.minOrder} onChange={handleChange} minValue='0' />
            {form.type === 'percent' && (
              <InputField label='Maximum discount (₹, 0 = no limit)' name='maxDiscount' type='number' value={form.maxDiscount} onChange={handleChange} minValue='0' />
            )}
          </div>
          <label className='mb-4 flex items-center gap-2 font-semibold text-dark'>
            <input type='checkbox' name='firstOrderOnly' checked={form.firstOrderOnly} onChange={handleChange} className='accent-primary' />
            Only for a customer's first order
          </label>
          {actionError && <p className='mb-4 text-red-600'>{actionError}</p>}
          <div className='flex gap-3'>
            <button type='submit' className='rounded bg-primary px-6 py-2 font-semibold text-white'>Create coupon</button>
            <button type='button' onClick={() => { setShowForm(false); setActionError('') }} className='rounded border px-6 py-2 font-semibold text-dark'>Cancel</button>
          </div>
        </form>
      ) : (
        <button type='button' onClick={() => { setShowForm(true); setActionError('') }} className='mb-6 rounded bg-primary px-6 py-2 font-semibold text-white'>
          + New coupon
        </button>
      )}

      {!showForm && actionError && <p className='mb-4 text-red-600'>{actionError}</p>}
      {error && <p className='mb-4 text-red-600'>{error.message}</p>}

      {isLoading && !coupons ? (
        <p className='text-gray-700'>Loading coupons...</p>
      ) : coupons?.length === 0 ? (
        <p className='text-gray-700'>No coupons yet. Create your first one!</p>
      ) : (
        <ul className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {coupons?.map((c) => (
            <li key={c._id} className={`rounded-lg bg-white p-5 shadow ${c.active ? '' : 'opacity-60'}`}>
              <div className='mb-2 flex flex-wrap items-start justify-between gap-2'>
                <div>
                  <p className='inline-block rounded border-2 border-dashed border-primary px-2 py-0.5 font-mono text-lg font-bold tracking-wider text-primary'>{c.code}</p>
                  {c.description && <p className='mt-1 text-sm text-gray-600'>{c.description}</p>}
                </div>
                <button
                  type='button'
                  onClick={() => toggle(c)}
                  disabled={busyId === c._id}
                  aria-pressed={c.active}
                  className={`rounded-full px-3 py-1 text-sm font-semibold disabled:opacity-60 ${c.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}
                >
                  {c.active ? 'Active' : 'Off'}
                </button>
              </div>
              <p className='font-bold text-dark'>{offerText(c)}</p>
              <div className='mt-1 flex flex-wrap gap-2 text-xs'>
                {c.minOrder > 0 && <span className='rounded bg-gray-100 px-2 py-1 text-gray-700'>Min order {rupees(c.minOrder)}</span>}
                {c.firstOrderOnly && <span className='rounded bg-blue-100 px-2 py-1 font-semibold text-blue-800'>First order only</span>}
              </div>
              <p className='mt-3 text-sm text-gray-600'>
                Used {c.uses} {c.uses === 1 ? 'time' : 'times'} · {rupees(c.totalDiscount)} discount given
              </p>
              <button type='button' onClick={() => remove(c)} className='mt-3 rounded border border-primary px-3 py-1 text-sm text-primary'>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CouponsTab
