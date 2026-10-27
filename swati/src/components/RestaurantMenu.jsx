// RestaurantMenu: the "Order Online" tab of a restaurant page.
// Loads the menu, groups dishes by category, and has "Veg only" + category filters.
// ADD / − / + buttons change the cart (useCart). Adding is disabled while the restaurant
// is closed, and sold-out dishes can't be added. Prop: restaurant.

import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import { useCart } from '../context/cartContext'
import { isOpenNow } from '../utils/time'
import QuantityControl from './QuantityControl'
import VegIcon from './VegIcon'

const RestaurantMenu = ({ restaurant }) => {
  const { data: menu, error, isLoading } = useFetch(`/api/restaurants/${restaurant._id}/menu`)
  const cart = useCart()
  const [vegOnly, setVegOnly] = useState(false)
  const [category, setCategory] = useState('')
  const isOpen = isOpenNow(restaurant)

  if (isLoading) return <p className='text-gray-700'>Loading menu...</p>
  if (error) return <p className='text-red-600'>{error.message}</p>
  if (!menu.length) return <p className='text-gray-700'>This restaurant hasn't added its menu yet.</p>

  const categories = [...new Set(menu.map((m) => m.category))]
  const visible = menu.filter((m) => (!vegOnly || m.isVeg) && (!category || m.category === category))
  const grouped = categories
    .map((c) => ({ category: c, items: visible.filter((m) => m.category === c) }))
    .filter((g) => g.items.length)

  return (
    <div>
      {!isOpen && (
        <p className='mb-4 rounded bg-yellow-50 p-3 text-sm text-yellow-800'>
          {restaurant.name} is closed right now. Online orders open at {restaurant.openTime}.
        </p>
      )}

      <div className='mb-6 flex flex-wrap items-center gap-2'>
        <label className='mr-2 flex cursor-pointer items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm font-semibold'>
          <input type='checkbox' checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} className='accent-green-700' />
          <VegIcon isVeg /> Veg only
        </label>
        {['', ...categories].map((c) => (
          <button
            key={c || 'all'}
            type='button'
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              category === c ? 'border-primary bg-primary text-white' : 'bg-white text-dark hover:border-primary'
            }`}
          >
            {c || 'All'}
          </button>
        ))}
      </div>

      {grouped.length === 0 && <p className='text-gray-700'>No dishes match these filters.</p>}

      {grouped.map((group) => (
        <section key={group.category} className='mb-8'>
          <h3 className='mb-3 text-xl font-bold text-dark'>
            {group.category} <span className='text-sm font-normal text-gray-500'>({group.items.length})</span>
          </h3>
          <ul className='divide-y rounded-lg bg-white shadow'>
            {group.items.map((item) => (
              <li key={item._id} className={`flex items-start justify-between gap-4 p-4 ${item.isAvailable ? '' : 'opacity-60'}`}>
                <div className='min-w-0'>
                  <div className='mb-1 flex items-center gap-2'>
                    <VegIcon isVeg={item.isVeg} />
                    <h4 className='font-semibold text-dark'>{item.name}</h4>
                  </div>
                  <p className='font-semibold text-dark'>₹{item.price}</p>
                  {item.description && <p className='mt-1 text-sm text-gray-600'>{item.description}</p>}
                </div>
                <div className='flex shrink-0 flex-col items-center gap-1'>
                  {item.image && <img src={item.image} alt={item.name} className='mb-1 h-20 w-24 rounded object-cover' />}
                  {item.isAvailable ? (
                    <QuantityControl
                      label={item.name}
                      quantity={cart.quantityOf(item._id)}
                      disabled={!isOpen}
                      onAdd={() => cart.addItem(restaurant, { menuItem: item._id, name: item.name, price: item.price, isVeg: item.isVeg })}
                      onRemove={() => cart.decreaseItem(item._id)}
                    />
                  ) : (
                    <span className='w-24 rounded border py-1.5 text-center text-xs font-semibold text-gray-500'>Sold out</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default RestaurantMenu
