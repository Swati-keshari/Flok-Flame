// Admin → Messages tab: messages sent from the home page Contact form.
// Clicking the email opens a reply in your mail app. Prop: onUnauthorized.

import { useState } from 'react'
import { deleteJSON } from '../../api'
import { useAdminFetch } from '../../hooks/useFetch'

const formatDate = (iso) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

const MessagesTab = ({ onUnauthorized }) => {
  const { data: messages, error, isLoading, setData } = useAdminFetch('/api/contact', undefined, onUnauthorized)
  const [actionError, setActionError] = useState('')

  const remove = async (msg) => {
    if (!window.confirm(`Delete message from ${msg.fullName}?`)) return
    setActionError('')
    try {
      await deleteJSON(`/api/contact/${msg._id}`)
      setData((prev) => prev.filter((m) => m._id !== msg._id))
    } catch (err) {
      if (err.status === 401) return onUnauthorized()
      setActionError(err.message)
    }
  }

  if (isLoading) return <p className='text-gray-700'>Loading messages...</p>

  return (
    <div>
      {(error || actionError) && <p className='mb-4 text-red-600'>{actionError || error.message}</p>}
      {messages?.length === 0 && <p className='text-gray-700'>No messages yet.</p>}
      <ul className='space-y-4'>
        {messages?.map((m) => (
          <li key={m._id} className='rounded-lg bg-white p-5 shadow'>
            <div className='mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <h3 className='font-bold text-dark'>{m.subject}</h3>
                <p className='text-sm text-gray-600'>
                  {m.fullName} · <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className='text-primary'>{m.email}</a>
                </p>
              </div>
              <span className='shrink-0 text-xs text-gray-500'>{formatDate(m.createdAt)}</span>
            </div>
            <p className='whitespace-pre-line text-gray-800'>{m.message}</p>
            <button type='button' onClick={() => remove(m)} className='mt-3 rounded border border-primary px-3 py-1 text-sm text-primary'>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MessagesTab
