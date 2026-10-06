import { FaClock, FaEnvelope, FaLocationArrow, FaPhone } from 'react-icons/fa6'

const Contact = () => {
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
                            <p className='w-60'>123 Gourmet street, food District New yark
                                y-10001

                            </p>

                        </div>
                    </div>
                     <div className='flex items-center gap-6 mb-6'>
                        <div className='w-12 h-12 bg-primary
                        text-white rounded-full flex items-center justify-center'>
                            < FaPhone/>
                        </div>
                        <div className='mt-4'>
                            <p className='text-xl text-dark font-semibold'>Phone</p>
                            <p className='w-60'> +91 8793847572</p>

                        </div>
                    </div>
                     <div className='flex items-center gap-6 mb-6'>
                        <div className='w-12 h-12 bg-primary
                        text-white rounded-full flex items-center justify-center'>
                            < FaEnvelope/>
                        </div>
                        <div className='mt-4'>
                            <p className='text-xl text-dark font-semibold'>Email</p>
                            <p className='w-60'>info@swati.com</p>

                        </div>
                    </div>
                     <div className='flex items-center gap-6 mb-6'>
                        <div className='w-12 h-12 bg-primary
                        text-white rounded-full flex items-center justify-center'>
                            < FaClock/>
                        </div>
                        <div className='mt-4'>
                            <p className='text-xl text-dark font-semibold'>Hour</p>
                            <p className='w-60'>Monday-Thursday:5:00PM to 10:00PM
                              Friday-Saturday: 5:00 PM to 11:00

                            </p>

                        </div>
                    </div>
                </div>

                </div>
                {/* right side */}
                <div className='md:w-1/2 w-full p-8'>
                    <h2 className='text-2xl mb-6 text-dark font-semibold'>Send a Message</h2>
                    <form className='space-y-5'>
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
                        <button
                            type='button'
                            className='bg-primary text-white font-semibold px-6 py-3 rounded-md hover:opacity-90 transition'
                        >
                            Send Message
                        </button>
                    </form>
                </div>

            </div>

        </div>
    </div>
  )
}

export default Contact
