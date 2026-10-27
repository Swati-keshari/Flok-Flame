// InputField: a label + input box, reused by most forms.
// Props: label, name, value, onChange, type, placeholder, required,
// minValue (min for numbers), step (e.g. "any" to allow decimals).
// For type="date" it blocks past dates (min = today).

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, required = false, minValue, step }) => {
    // Local date (toISOString would give the UTC date, which is "yesterday" after midnight in India)
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
   return (

    <div className='mb-4'>
      <label htmlFor={name} className='block text-dark mb-2 font-semibold '>
        {label}</label>
       <input 
      id={name}
       name={name}
       value={value}
       onChange={onChange}
       placeholder={placeholder}
        required={required}
      min={type === 'date' ? today : minValue}
      step={step}
       className='w-full px-4 py-2 rounded border placeholder:text-xs'
       type={type}
       />
       
    </div>
  )
}

export default InputField
