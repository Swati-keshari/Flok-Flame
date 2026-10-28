// Contact section on the home page ("Let's talk").
// Left: address, phone, email, hours. Right: "Send a Message" form that posts to /api/contact.
// Admins read these messages in Admin Panel → Messages.

import { useState } from 'react'
import { FaClock, FaEnvelope, FaLocationArrow, FaPhone } from 'react-icons/fa6'
import { postJSON } from '../api'
import { phoneLink, siteInfo } from '../siteInfo'

const Contact = () => {
  const [status, setStatus] = useState({ type: '', text: '' })
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    const data = Object.fromEntries(new FormData(form))
    setIsSending(true)
    setStatus({ type: '', text: '' })
    try {
      const res = await postJSON('/api/contact', data)
      setStatus({ type: 'success', text: res.message })
      form.reset()
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div id='contact' className='py-20 bg-white'>
        <div className='container mx-auto px-6'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl text-dark font-bold mb-8'>Let's talk</h1>
                <div className='w-20 h-1 bg-primary mx-auto mb-4'></div>
                <p className='text-gray-700'>We'd love to hear from you</p>


            </div>
            <div className='flex flex-col md:flex-row items-center
            justify-between'>
                {/*left -side*/}
                <div className='md:w-1/2'>
                <div className='w-full overflow-hidden p-8'>
                    <h1 className='text-2xl mb-6 text-dark font-semibold'>Get in Touch</h1>
                    <div className='flex items-center gap-6 mb-6'>
                        <div className='w-12 h-12 bg-primary
                        text-white rounded-full flex items-center justify-center'>
                            < FaLocationArrow/>
                        </div>
                        <div className='mt-4'>
                            <p className='text-xl text-dark font-semibold'>Address</p>
                            <p className='max-w-60'>{siteInfo.address}</p>

                        </div>
                    </div>
                     <div className='flex items-center gap-6 mb-6'>
                        <div className='w-12 h-12 bg-primary
                        text-white rounded-full flex items-center justify-center'>
                            < FaPhone/>
                        </div>
                        <div className='mt-4'>
                            <p className='text-xl text-dark font-semibold'>Phone</p>
                            <a href={phoneLink} className='max-w-60 hover:text-primary'>{siteInfo.phone}</a>

                        </div>
                    </div>
                     <div className='flex items-center gap-6 mb-6'>
                        <div className='w-12 h-12 bg-primary
                        text-white rounded-full flex items-center justify-center'>
                            < FaEnvelope/>
                        </div>
                        <div className='mt-4'>
                            <p className='text-xl text-dark font-semibold'>Email</p>
                            <a href={`mailto:${siteInfo.email}`} className='max-w-60 break-all hover:text-primary'>{siteInfo.email}</a>

                        </div>
                    </div>
                     <div className='flex items-center gap-6 mb-6'>
                        <div className='w-12 h-12 bg-primary
                        text-white rounded-full flex items-center justify-center'>
                            < FaClock/>
                        </div>
                        <div className='mt-4'>
                            <p className='text-xl text-dark font-semibold'>Hours</p>
                            {siteInfo.hours.map((h) => (
                              <p key={h.days} className='max-w-60'>{h.days}<br />{h.time}</p>
                            ))}

                        </div>
                    </div>
                </div>

                </div>
                {/* right side */}
                <div className='md:w-1/2 w-full p-8'>
                    <h2 className='text-2xl mb-6 text-dark font-semibold'>Send a Message</h2>
                    <form onSubmit={handleSubmit} className='space-y-5'>
                        <div>
                            <label htmlFor='fullName' className='block mb-2 text-gray-700 font-medium'>Full Name</label>
                            <input
                                id='fullName'
                                name='fullName'
                                type='text'
                                placeholder='Enter your full name'
                                autoComplete='name'
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                            />
                        </div>
                        <div>
                            <label htmlFor='email' className='block mb-2 text-gray-700 font-medium'>Email Address</label>
                            <input
                                id='email'
                                name='email'
                                type='email'
                                placeholder='Enter your email address'
                                autoComplete='email'
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                            />
                        </div>
                        <div>
                            <label htmlFor='subject' className='block mb-2 text-gray-700 font-medium'>Subject</label>
                            <input
                                id='subject'
                                name='subject'
                                type='text'
                                placeholder='Enter the subject'
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                            />
                        </div>
                        <div>
                            <label htmlFor='message' className='block mb-2 text-gray-700 font-medium'>Message</label>
                            <textarea
                                id='message'
                                name='message'
                                rows='5'
                                placeholder='Write your message'
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                            />
                        </div>
                        {status.text && (
                            <p className={status.type === 'success' ? 'text-green-600' : 'text-red-600'}>{status.text}</p>
                        )}
                        <button
                            type='submit'
                            disabled={isSending}
                            className='bg-primary text-white font-semibold px-6 py-3 rounded-md hover:opacity-90 transition disabled:opacity-60'
                        >
                            {isSending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>

            </div>

        </div>
    </div>
  )
}

export default Contact
