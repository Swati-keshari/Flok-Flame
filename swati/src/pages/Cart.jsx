// Checkout page (route "/cart").
// - Left: delivery details form (name, phone, email, address, optional GPS location) and
//   payment choice (Pay Online via Razorpay, or Cash on Delivery).
// - Right: cart items and the bill.
// The bill is always calculated by the SERVER (/api/orders/quote), not in the browser,
// so nobody can change prices. The server also says if the restaurant is open and
// if the address is inside the delivery range.
// After placing the order the user goes to /orders/:id (tracking page).

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaLocationCrosshairs, FaTrash } from 'react-icons/fa6'
import { postJSON } from '../api'
import { useCart } from '../context/cartContext'
import InputField from '../components/InputField'
import QuantityControl from '../components/QuantityControl'
import VegIcon from '../components/VegIcon'
import { loadDeliveryDetails, rememberOrder, saveDeliveryDetails } from '../utils/recentOrders'
import { useCustomer } from '../context/customerContext'
import { payForOrder } from '../utils/razorpay'
import useFetch from '../hooks/useFetch'

const emptyDetails = { name: '', email: '', phone: '', line: '', landmark: '', note: '' }

const Cart = () => {
  const cart = useCart()
  const navigate = useNavigate()
  const { customer } = useCustomer()
  // Prefill: last used address, and name/email/phone from the account when logged in
  const [details, setDetails] = useState(() => ({
    ...emptyDetails,
    ...loadDeliveryDetails(),
    ...(customer && { name: customer.name, email: customer.email, phone: customer.phone }),
    note: '',
  }))
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [quote, setQuote] = useState({ key: null, bill: null, error: '' })
  const [isPlacing, setIsPlacing] = useState(false)
  const [placeError, setPlaceError] = useState('')
  const { data: paymentOptions } = useFetch('/api/orders/payment-options')
  const [paymentChoice, setPaymentChoice] = useState(null)
  // Default to online payment when the server has Razorpay set up
  const paymentMethod = paymentChoice ?? (paymentOptions?.online ? 'online' : 'cod')

  // Ask the server for the real bill whenever the cart or location changes
  const quoteKey = cart.restaurant
    ? JSON.stringify({
        restaurant: cart.restaurant._id,
        items: cart.items.map((i) => ({ menuItem: i.menuItem, quantity: i.quantity })),
        location,
      })
    : null
  useEffect(() => {
    if (!quoteKey) return
    let ignore = false
    postJSON('/api/orders/quote', JSON.parse(quoteKey))
      .then((bill) => !ignore && setQuote({ key: quoteKey, bill, error: '' }))
      .catch((err) => !ignore && setQuote({ key: quoteKey, bill: null, error: err.message }))
    return () => { ignore = true }
  }, [quoteKey])

  const handleChange = (event) => {
    const { name, value } = event.target
    setDetails((prev) => ({ ...prev, [name]: value }))
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return setPlaceError('Your browser does not support location')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setPlaceError('Could not get your location. You can still order with just the address.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    setPlaceError('')
    setIsPlacing(true)
    try {
      const order = await postJSON('/api/orders', {
        ...JSON.parse(quoteKey),
        customer: { name: details.name, email: details.email, phone: details.phone },
        address: { line: details.line, landmark: details.landmark },
        note: details.note,
        paymentMethod,
      })
      saveDeliveryDetails({ ...details, note: '' })
      rememberOrder(order._id, details.phone)
      if (order.checkout) {
        // If the popup is closed or verification fails, the tracking page
        // shows "Payment pending" with a Pay now button
        await payForOrder({ order, checkout: order.checkout, phone: details.phone }).catch(() => {})
      }
      cart.clearCart()
      navigate(`/orders/${order._id}`, { replace: true })
    } catch (err) {
      setPlaceError(err.message)
      setIsPlacing(false)
    }
  }

  if (!cart.restaurant) {
    return (
      <div className='min-h-[60vh] bg-secondary py-20 text-center'>
        <h1 className='mb-3 text-2xl font-bold text-dark'>Your cart is empty</h1>
        <p className='mb-6 text-gray-700'>Add some delicious food from a restaurant near you.</p>
        <Link to='/restaurants' className='rounded-full bg-primary px-8 py-3 font-semibold text-white'>Browse restaurants</Link>
      </div>
    )
  }

  const bill = quote.key === quoteKey ? quote.bill : null
  const quoteError = quote.key === quoteKey ? quote.error : ''
  const blocked = bill && (!bill.isOpen || !bill.deliverable)

  return (
    <div className='min-h-screen bg-secondary py-10'>
      <div className='container mx-auto px-6'>
        <h1 className='mb-6 text-3xl font-bold text-dark'>Checkout</h1>
        <form onSubmit={placeOrder} className='flex flex-col gap-8 lg:flex-row'>
          {/* delivery details */}
          <div className='lg:w-3/5'>
            <div className='rounded-lg bg-white p-6 shadow'>
              <h2 className='mb-4 text-xl font-bold text-dark'>Delivery details</h2>
              {!customer && (
                <p className='mb-4 -mt-2 text-sm text-gray-600'>
                  <Link to='/login?next=/cart' className='font-semibold text-primary'>Log in</Link> to fill these in automatically and keep all your orders in one place.
                </p>
              )}
              <div className='grid grid-cols-1 gap-x-6 md:grid-cols-2'>
                <InputField label='Full Name' name='name' value={details.name} onChange={handleChange} placeholder='Your name' required />
                <InputField label='Phone' name='phone' type='tel' value={details.phone} onChange={handleChange} placeholder='For the delivery partner' required />
                <div className='md:col-span-2'>
                  <InputField label='Email' name='email' type='email' value={details.email} onChange={handleChange} placeholder='you@example.com' required />
                </div>
                <div className='mb-4 md:col-span-2'>
                  <label htmlFor='line' className='block text-dark mb-2 font-semibold'>Address</label>
                  <textarea id='line' name='line' value={details.line} onChange={handleChange} rows='2' required placeholder='House / flat no., street, area' className='w-full px-4 py-2 rounded border placeholder:text-xs' />
                </div>
                <InputField label='Landmark (optional)' name='landmark' value={details.landmark} onChange={handleChange} placeholder='Near ...' />
                <div className='mb-4 flex items-end'>
                  <button
                    type='button'
                    onClick={useMyLocation}
                    disabled={locating}
                    className='flex w-full items-center justify-center gap-2 rounded border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary hover:text-white transition disabled:opacity-60'
                  >
                    <FaLocationCrosshairs /> {locating ? 'Locating...' : location ? 'Location added ✓' : 'Use my current location'}
                  </button>
                </div>
                <div className='mb-4 md:col-span-2'>
                  <label htmlFor='note' className='block text-dark mb-2 font-semibold'>Note for restaurant (optional)</label>
                  <input id='note' name='note' value={details.note} onChange={handleChange} placeholder='Less spicy, no onion...' className='w-full px-4 py-2 rounded border placeholder:text-xs' />
                </div>
              </div>

              <h2 className='mb-3 mt-2 text-xl font-bold text-dark'>Payment</h2>
              <div className='space-y-3' role='radiogroup' aria-label='Payment method'>
                {[
                  paymentOptions?.online && { value: 'online', title: 'Pay Online', hint: 'UPI, cards, netbanking & wallets via Razorpay' },
                  { value: 'cod', title: 'Cash on Delivery', hint: 'Pay cash or UPI to the delivery partner' },
                ].filter(Boolean).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded border px-4 py-3 transition ${
                      paymentMethod === opt.value ? 'border-primary bg-secondary' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type='radio'
                      name='paymentMethod'
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentChoice(opt.value)}
                      className='accent-primary'
                    />
                    <span className='font-semibold text-dark'>{opt.title}</span>
                    <span className='text-sm text-gray-600'>{opt.hint}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* order summary */}
          <div className='lg:w-2/5 lg:sticky lg:top-24 lg:self-start'>
            <div className='rounded-lg bg-white p-6 shadow'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-bold text-dark'>{cart.restaurant.name}</h2>
                <Link to={`/restaurants/${cart.restaurant._id}`} className='text-sm font-semibold text-primary'>+ Add more</Link>
              </div>
              <ul className='mb-4 divide-y'>
                {cart.items.map((item) => (
                  <li key={item.menuItem} className='flex items-center justify-between gap-3 py-3'>
                    <div className='flex min-w-0 items-center gap-2'>
                      <VegIcon isVeg={item.isVeg} />
                      <span className='truncate text-dark'>{item.name}</span>
                    </div>
                    <div className='flex shrink-0 items-center gap-3'>
                      <QuantityControl
                        label={item.name}
                        quantity={item.quantity}
                        onAdd={() => cart.addItem(cart.restaurant, item)}
                        onRemove={() => cart.decreaseItem(item.menuItem)}
                      />
                      <span className='w-16 text-right font-semibold'>₹{item.price * item.quantity}</span>
                      <button type='button' onClick={() => cart.removeItem(item.menuItem)} aria-label={`Remove ${item.name}`} className='text-gray-400 hover:text-primary'>
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {quoteError && (
                <div className='mb-4 text-sm text-red-600'>
                  <p>{quoteError}</p>
                  {/no longer on the menu|not found/i.test(quoteError) && (
                    <button type='button' onClick={cart.clearCart} className='mt-2 rounded border border-primary px-3 py-1 font-semibold text-primary'>
                      Clear cart
                    </button>
                  )}
                </div>
              )}
              {!bill && !quoteError && <p className='mb-4 text-sm text-gray-600'>Calculating bill...</p>}
              {bill && (
                <dl className='mb-4 space-y-2 border-t pt-4 text-sm'>
                  <div className='flex justify-between'><dt>Item total</dt><dd>₹{bill.subtotal}</dd></div>
                  <div className='flex justify-between'>
                    <dt>Delivery fee{bill.distanceKm !== null && ` (${bill.distanceKm} km)`}</dt>
                    <dd>{bill.deliveryFee === 0 ? <span className='font-semibold text-green-700'>FREE</span> : `₹${bill.deliveryFee}`}</dd>
                  </div>
                  {bill.deliveryFee > 0 && (
                    <p className='text-xs text-green-700'>Add ₹{bill.freeDeliveryAbove - bill.subtotal} more for free delivery</p>
                  )}
                  <div className='flex justify-between'><dt>GST (5%)</dt><dd>₹{bill.tax}</dd></div>
                  <div className='flex justify-between border-t pt-2 text-base font-bold text-dark'><dt>To pay</dt><dd>₹{bill.total}</dd></div>
                </dl>
              )}
              {bill && !bill.isOpen && <p className='mb-4 text-sm text-red-600'>{cart.restaurant.name} is closed right now, so orders can't be placed.</p>}
              {bill && !bill.deliverable && (
                <p className='mb-4 text-sm text-red-600'>
                  You are {bill.distanceKm} km away. {cart.restaurant.name} delivers only within {bill.restaurant.deliveryRadiusKm} km.
                </p>
              )}
              {placeError && <p className='mb-4 text-sm text-red-600'>{placeError}</p>}

              <button
                type='submit'
                disabled={!bill || blocked || isPlacing}
                className='w-full rounded bg-primary px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isPlacing
                  ? (paymentMethod === 'online' ? 'Waiting for payment...' : 'Placing order...')
                  : bill
                    ? (paymentMethod === 'online' ? `Pay ₹${bill.total}` : `Place Order · ₹${bill.total}`)
                    : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Cart
