import React from 'react'

const TextAreaField = ({label,name,value ,onChange ,placeholder}) => {
  return (
    <div className='mb-4'>
     <label htmlFor={name} className='block text-dark mb-2 font-semibold '>
        {label}
        </label>  
        <textarea 
        id='{name}'
        name={name}
       value={value}
       onChange={onChange}
       placeholder={placeholder}
       rows="4"
       className='w-full px-4 py-2 rounded  placeholder:text-xs'
        />
      
    </div>
  )
}

export default TextAreaField
