// ImageUpload: pick a photo from the computer and upload it (admin only).
// Used by MenuEditor (dish photo) and RestaurantForm (restaurant photo).
// Props: label, value (current image URL or ''), onChange(url), onUnauthorized.
// Sends the file to POST /api/uploads; the server saves it and returns { url }.
// Only JPG / PNG / WEBP / AVIF up to 2 MB are accepted (the server checks this too).

import { useState } from 'react'
import { getToken } from '../../api'

const API_URL = import.meta.env.VITE_API_URL || ''
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'

// Uploaded photos are "/uploads/..." on the backend; full URLs (https://...) are used as they are
const imageSrc = (url) => (url?.startsWith('/uploads/') ? `${API_URL}${url}` : url)

const ImageUpload = ({ label = 'Photo', value, onChange, onUnauthorized }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // so choosing the same file again still triggers a change
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return setError('Image is too big (max 2 MB)')
    setError('')
    setIsUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      // No Content-Type header: the browser adds the right multipart boundary itself
      const res = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) return onUnauthorized?.()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      onChange(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className='mb-4'>
      <p className='mb-2 font-semibold text-dark'>{label}</p>
      <div className='flex flex-wrap items-center gap-4'>
        {value ? (
          <img src={imageSrc(value)} alt='' className='h-20 w-20 rounded border object-cover' />
        ) : (
          <div className='flex h-20 w-20 items-center justify-center rounded border border-dashed text-xs text-gray-400'>No photo</div>
        )}
        <div className='flex flex-col gap-2'>
          <label className={`cursor-pointer rounded bg-accent px-4 py-2 text-center text-sm font-semibold text-white ${isUploading ? 'opacity-60' : ''}`}>
            {isUploading ? 'Uploading...' : value ? 'Change photo' : 'Upload photo'}
            <input type='file' accept={ACCEPT} onChange={handleFile} disabled={isUploading} className='sr-only' />
          </label>
          {value && !isUploading && (
            <button type='button' onClick={() => onChange('')} className='text-sm font-semibold text-primary'>Remove photo</button>
          )}
        </div>
      </div>
      <p className='mt-1 text-xs text-gray-500'>JPG, PNG, WEBP or AVIF · max 2 MB</p>
      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
    </div>
  )
}

export default ImageUpload
