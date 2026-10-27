// Admin → Subscribers tab: emails that joined the newsletter (Footer form).
// "Copy all emails" copies them for use in a mail tool. Prop: onUnauthorized.

import { useState } from 'react'
import { deleteJSON } from '../../api'
import { useAdminFetch } from '../../hooks/useFetch'

const SubscribersTab = ({ onUnauthorized }) => {
  const { data: subscribers, error, isLoading, setData } = useAdminFetch('/api/newsletter', undefined, onUnauthorized)
  const [actionError, setActionError] = useState('')
  const [copied, setCopied] = useState(false)

  const remove = async (sub) => {
    if (!window.confirm(`Remove ${sub.email} from the newsletter?`)) return
    setActionError('')
    try {
      await deleteJSON(`/api/newsletter/${sub._id}`)
      setData((prev) => prev.filter((s) => s._id !== sub._id))
    } catch (err) {
      if (err.status === 401) return onUnauthorized()
      setActionError(err.message)
    }
  }

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(subscribers.map((s) => s.email).join(', '))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setActionError('Could not copy to clipboard')
    }
  }

  if (isLoading) return <p className='text-gray-700'>Loading subscribers...</p>

  return (
    <div>
      {(error || actionError) && <p className='mb-4 text-red-600'>{actionError || error.message}</p>}
      {subscribers?.length === 0 && <p className='text-gray-700'>No subscribers yet.</p>}
      {subscribers?.length > 0 && (
        <>
          <div className='mb-4 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>{subscribers.length} subscribers</p>
            <button type='button' onClick={copyAll} className='rounded bg-accent px-4 py-2 text-sm font-semibold text-white'>
              {copied ? 'Copied!' : 'Copy all emails'}
            </button>
          </div>
          <ul className='divide-y rounded-lg bg-white shadow'>
            {subscribers.map((s) => (
              <li key={s._id} className='flex items-center justify-between gap-4 px-5 py-3'>
                <div className='min-w-0'>
                  <p className='truncate font-semibold text-dark'>{s.email}</p>
                  <p className='text-xs text-gray-500'>Joined {new Date(s.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <button type='button' onClick={() => remove(s)} className='shrink-0 text-sm font-semibold text-primary'>Remove</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default SubscribersTab
