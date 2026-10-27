// MenuEditor: manage one restaurant's dishes (opened from RestaurantsTab → Menu).
// Add / edit / delete dishes and toggle "In stock" / "Sold out".
// Props: restaurant, onClose, onUnauthorized.

import { useState } from 'react'
import { deleteJSON, postJSON, putJSON } from '../../api'
import useFetch from '../../hooks/useFetch'
import InputField from '../InputField'
import VegIcon from '../VegIcon'

const emptyItem = { name: '', price: '', category: '', description: '', isVeg: true, image: '' }

const MenuEditor = ({ restaurant, onClose, onUnauthorized }) => {
  const { data: menu, error, isLoading, setData } = useFetch(`/api/restaurants/${restaurant._id}/menu`)
  // null = no form, 'new' = adding, object = editing that item
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyItem)
  const [actionError, setActionError] = useState('')

  const handleError = (err) => {
    if (err.status === 401) return onUnauthorized()
    setActionError(err.message)
  }

  const openForm = (item) => {
    setActionError('')
    setEditing(item || 'new')
    setForm(item ? { ...emptyItem, ...item, price: String(item.price) } : emptyItem)
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const save = async (event) => {
    event.preventDefault()
    setActionError('')
    const body = { ...form, price: Number(form.price), category: form.category || 'Main Course' }
    try {
      if (editing === 'new') {
        const created = await postJSON('/api/menu', { ...body, restaurant: restaurant._id })
        setData((prev) => [...prev, created])
      } else {
        const updated = await putJSON(`/api/menu/${editing._id}`, body)
        setData((prev) => prev.map((m) => (m._id === updated._id ? updated : m)))
      }
      setEditing(null)
    } catch (err) {
      handleError(err)
    }
  }

  const toggleAvailable = async (item) => {
    try {
      const updated = await putJSON(`/api/menu/${item._id}`, { isAvailable: !item.isAvailable })
      setData((prev) => prev.map((m) => (m._id === updated._id ? updated : m)))
    } catch (err) {
      handleError(err)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.name} from the menu?`)) return
    try {
      await deleteJSON(`/api/menu/${item._id}`)
      setData((prev) => prev.filter((m) => m._id !== item._id))
    } catch (err) {
      handleError(err)
    }
  }

  const categories = [...new Set((menu || []).map((m) => m.category))]

  return (
    <div className='mb-6 rounded-lg bg-white p-6 shadow'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-xl font-bold text-dark'>Menu · {restaurant.name}</h2>
        <div className='flex gap-2'>
          <button type='button' onClick={() => openForm(null)} className='rounded bg-primary px-4 py-2 text-sm font-semibold text-white'>+ Add dish</button>
          <button type='button' onClick={onClose} className='rounded border px-4 py-2 text-sm font-semibold text-dark'>Close</button>
        </div>
      </div>

      {editing && (
        <form onSubmit={save} className='mb-6 rounded border bg-gray-50 p-4'>
          <div className='grid grid-cols-1 gap-x-6 md:grid-cols-2'>
            <InputField label='Dish name' name='name' value={form.name} onChange={handleChange} required />
            <InputField label='Price (₹)' name='price' type='number' value={form.price} onChange={handleChange} minValue='1' required />
            <div className='mb-4'>
              <label htmlFor='category' className='block text-dark mb-2 font-semibold'>Category</label>
              <input id='category' name='category' list='menu-categories' value={form.category} onChange={handleChange} placeholder='Main Course' className='w-full px-4 py-2 rounded border placeholder:text-xs' />
              <datalist id='menu-categories'>
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <InputField label='Image URL (optional)' name='image' type='url' value={form.image} onChange={handleChange} />
            <div className='mb-4 md:col-span-2'>
              <InputField label='Description' name='description' value={form.description} onChange={handleChange} />
            </div>
          </div>
          <label className='mb-4 flex items-center gap-2 font-semibold text-dark'>
            <input type='checkbox' name='isVeg' checked={form.isVeg} onChange={handleChange} className='accent-green-700' />
            Vegetarian
          </label>
          <div className='flex gap-3'>
            <button type='submit' className='rounded bg-primary px-6 py-2 font-semibold text-white'>Save dish</button>
            <button type='button' onClick={() => setEditing(null)} className='rounded border px-6 py-2 font-semibold text-dark'>Cancel</button>
          </div>
        </form>
      )}

      {(error || actionError) && <p className='mb-4 text-red-600'>{actionError || error.message}</p>}
      {isLoading ? (
        <p className='text-gray-700'>Loading menu...</p>
      ) : menu.length === 0 ? (
        <p className='text-gray-700'>No dishes yet.</p>
      ) : (
        <ul className='divide-y'>
          {menu.map((item) => (
            <li key={item._id} className='flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className={`flex items-center gap-2 ${item.isAvailable ? '' : 'opacity-50'}`}>
                <VegIcon isVeg={item.isVeg} />
                <span className='font-semibold text-dark'>{item.name}</span>
                <span className='text-sm text-gray-500'>· {item.category} · ₹{item.price}</span>
              </div>
              <div className='flex shrink-0 gap-2 text-sm'>
                <button type='button' onClick={() => toggleAvailable(item)} className={`rounded px-3 py-1 font-semibold ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                  {item.isAvailable ? 'In stock' : 'Sold out'}
                </button>
                <button type='button' onClick={() => openForm(item)} className='rounded bg-accent px-3 py-1 text-white'>Edit</button>
                <button type='button' onClick={() => remove(item)} className='rounded border border-primary px-3 py-1 text-primary'>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MenuEditor
