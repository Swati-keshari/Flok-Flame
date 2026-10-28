// QuantityControl: the "ADD" button that turns into  −  2  +  once a dish is in the cart.
// Props: quantity, onAdd, onRemove, disabled, label (dish name, for screen readers).
// disabled = the restaurant is closed right now, so the button says "CLOSED" instead of "ADD".

// "ADD" button that turns into  −  2  +  once the item is in the cart
const QuantityControl = ({ quantity, onAdd, onRemove, disabled, label = 'item' }) => {
  if (quantity === 0) {
    return (
      <button
        type='button'
        onClick={onAdd}
        disabled={disabled}
        className='w-24 rounded border border-primary bg-white py-1.5 text-sm font-bold text-primary shadow-sm hover:bg-primary hover:text-white transition disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white'
      >
        {disabled ? 'CLOSED' : 'ADD'}
      </button>
    )
  }
  return (
    <div className='flex w-24 items-center justify-between rounded bg-primary text-white shadow-sm'>
      <button type='button' onClick={onRemove} aria-label={`Remove one ${label}`} className='px-3 py-1.5 font-bold'>−</button>
      <span className='text-sm font-bold' aria-live='polite'>{quantity}</span>
      <button type='button' onClick={onAdd} disabled={disabled} aria-label={`Add one more ${label}`} className='px-3 py-1.5 font-bold disabled:opacity-50'>+</button>
    </div>
  )
}

export default QuantityControl
