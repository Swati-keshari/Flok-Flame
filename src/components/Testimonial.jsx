import { useState } from 'react'
import { testimonials } from '../assets/fork-flame-static (11)/assets'

const Testimonial = () => {
    const [index, setIndex] = useState(0)

    const { name, message, image } = testimonials[index]

    const showPrevious = () => {
        setIndex((currentIndex) => (currentIndex - 1 + testimonials.length) % testimonials.length)
    }

    const showNext = () => {
        setIndex((currentIndex) => (currentIndex + 1) % testimonials.length)
    }

    return (
        <section className='bg-gray-100 py-20'>
            <h2 className='mb-8 text-center text-3xl font-bold'>What our people say</h2>
            <div className='mx-auto max-w-xl rounded-xl bg-white p-6 text-center shadow-md transition-all duration-500'>
                <img
                    src={image}
                    alt={`Portrait of ${name}`}
                    className='mx-auto mb-4 h-24 w-24 rounded-full object-cover'
                />
                <p className='mb-4 text-gray-700'>{message}</p>
                <h3 className='text-lg font-semibold'>{name}</h3>
            </div>

            <div className='mt-6 flex justify-center gap-6'>
                <button
                    type='button'
                    onClick={showPrevious}
                    aria-label='Previous testimonial'
                    className='rounded-full border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-200'
                >
                    &#8592;
                </button>
                <button
                    type='button'
                    onClick={showNext}
                    aria-label='Next testimonial'
                    className='rounded-full border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-200'
                >
                    &#8594;
                </button>
            </div>
        </section>
    )
}

export default Testimonial
