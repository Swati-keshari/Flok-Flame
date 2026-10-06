import React from 'react'

const ItemModel = ({isOpen,onClose,item}) => {
  if(!isOpen || !item) return null;
  return (
    <div className='fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm 
    flex justify-center items-center'>
      <div className='bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-lg
      relative'>
        <button onClick={onClose} className='absolute top-2 right-4  hover:text-white text-xl border w-8 h-8 rounded-full bg-primary
        text-white'>
               &times;
        </button>
        <img src={item.image} alt={item.name} className='w-full h-48 object-cover rounded mb-4 cursor-pointer' />
        <h2 className='text-xl font-semibold mb-8'>{item.title}</h2>
        <p className='text-gray-600 mb-2'>{item.description}</p>
        <p className='text-bold text-lg font-semibold text-primary'> {item.price}</p>

      </div>
    </div>
  )
}

export default ItemModel
