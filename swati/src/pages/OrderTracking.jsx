// Order tracking page (route "/orders/:id").
// - Shows the order steps: Placed → Preparing → Out for delivery → Delivered.
// - Refreshes every 15 seconds while the order is still active.
// - "Payment pending" box with a Pay now button for unpaid online orders.
// - Cancel button while the restaurant hasn't started preparing.
// The backend only shows an order to someone who knows its phone number, so we use the
// phone saved in this browser (utils/recentOrders) or ask for it.

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaCheck } from 'react-icons/fa6'
import { patchJSON } from '../api'
import useFetch from '../hooks/useFetch'
import InputField from '../components/InputField'
import VegIcon from '../components/VegIcon'
import { ORDER_STEPS, isActiveOrder, paymentLabel } from '../utils/orderStatus'
import { phoneForOrder, rememberOrder } from '../utils/recentOrders'
import { retryPayment } from '../utils/razorpay'

const REFRESH_MS = 15000
const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })

const OrderDetails = ({ id, phone, onChangePhone }) => {
  const { data: order, error, isLoading, reload, setData } = useFetch(`/api/orders/track/${id}`, { phone })
  const [cancelError, setCancelError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const active = order && isActiveOrder(order.status)

  // Keep checking for status updates while the order is on its way
  useEffect(() => {
    if (!active) return
    const timer = setInterval(reload, REFRESH_MS)
    return () => clearInterval(timer)
  }, [active, reload])

  if (isLoading && !order) return <p className='text-center text-gray-700'>Loading your order...</p>
  if (error && !order) {
    return (
      <div className='text-center'>
        <p className='mb-3 text-red-600'>{error.message}</p>
        {error.status === 404 && (
          <button type='button' onClick={onChangePhone} className='font-semibold text-primary'>Try a different phone number</button>
        )}
      </div>
    )
  }

  const cancelOrder = async () => {
    if (!window.confirm('Cancel this order?')) return
    setCancelError('')
    setIsCancelling(true)
    try {
      setData(await patchJSON(`/api/orders/${id}/cancel`, { phone }))
    } catch (err) {
      setCancelError(err.message)
      reload()
    } finally {
      setIsCancelling(false)
    }
  }

  const payNow = async () => {
    setPayError('')
    setIsPaying(true)
    try {
      setData(await retryPayment({ order, phone }))
    } catch (err) {
      if (!err.dismissed) setPayError(err.message)
      reload()
    } finally {
      setIsPaying(false)
    }
  }

  const stepIndex = ORDER_STEPS.findIndex((s) => s.status === order.status)
  const timeOf = (status) => order.statusHistory?.find((h) => h.status === status)?.at

  return (
    <div className='flex flex-col gap-8 lg:flex-row'>
      <div className='lg:w-3/5'>
        <div className='rounded-lg bg-white p-6 shadow'>
          <p className='text-sm text-gray-500'>Order #{order.orderNumber}</p>
          <h2 className='mb-6 text-2xl font-bold text-dark'>{order.restaurant?.name}</h2>

          {order.status === 'awaiting_payment' && (
            <div className='mb-6 rounded border border-red-200 bg-red-50 p-4'>
              <p className='font-semibold text-red-800'>Payment pending</p>
              <p className='mb-3 text-sm text-red-700'>
                Your order will be sent to the restaurant once the payment is complete.
              </p>
              {payError && <p className='mb-3 text-sm text-red-700'>{payError}</p>}
              <button
                type='button'
                onClick={payNow}
                disabled={isPaying}
                className='rounded bg-primary px-5 py-2 font-semibold text-white disabled:opacity-60'
              >
                {isPaying ? 'Opening payment...' : `Pay ₹${order.total} now`}
              </button>
            </div>
          )}

          {order.status === 'cancelled' ? (
            <div className='rounded bg-gray-100 p-4 text-gray-700'>
              <p className='font-semibold'>This order was cancelled.</p>
              {order.paymentStatus === 'refund_needed' && <p className='text-sm'>Your online payment will be refunded to the original payment method in 5–7 working days.</p>}
              {order.paymentStatus === 'refunded' && <p className='text-sm'>Your payment has been refunded.</p>}
            </div>
          ) : (
            <ol className='relative space-y-6'>
              {ORDER_STEPS.map((step, i) => {
                const done = i <= stepIndex
                const current = i === stepIndex
                return (
                  <li key={step.status} className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        done ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'
                      } ${current && active ? 'ring-4 ring-green-200' : ''}`}>
                        {done ? <FaCheck /> : i + 1}
                      </span>
                      {i < ORDER_STEPS.length - 1 && <span className={`mt-1 h-8 w-0.5 ${i < stepIndex ? 'bg-green-700' : 'bg-gray-200'}`} />}
                    </div>
                    <div>
                      <p className={`font-semibold ${done ? 'text-dark' : 'text-gray-400'}`}>
                        {step.label}
                        {timeOf(step.status) && <span className='ml-2 text-xs font-normal text-gray-500'>{formatTime(timeOf(step.status))}</span>}
                      </p>
                      {current && <p className='text-sm text-gray-600'>{step.hint}</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}

          {active && <p className='mt-6 text-xs text-gray-500'>This page updates automatically.</p>}
          {cancelError && <p className='mt-4 text-sm text-red-600'>{cancelError}</p>}
          {['awaiting_payment', 'placed'].includes(order.status) && (
            <button
              type='button'
              onClick={cancelOrder}
              disabled={isCancelling}
              className='mt-4 rounded border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition disabled:opacity-60'
            >
              {isCancelling ? 'Cancelling...' : 'Cancel order'}
            </button>
          )}
        </div>
      </div>

      <div className='lg:w-2/5'>
        <div className='rounded-lg bg-white p-6 shadow'>
          <h3 className='mb-3 font-bold text-dark'>Order summary</h3>
          <ul className='mb-4 space-y-2 text-sm'>
            {order.items.map((item) => (
              <li key={item.name} className='flex justify-between gap-3'>
                <span className='flex items-center gap-2'><VegIcon isVeg={item.isVeg} /> {item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <dl className='space-y-1 border-t pt-3 text-sm'>
            <div className='flex justify-between'><dt>Item total</dt><dd>₹{order.subtotal}</dd></div>
            <div className='flex justify-between'><dt>Delivery fee</dt><dd>{order.deliveryFee ? `₹${order.deliveryFee}` : 'FREE'}</dd></div>
            <div className='flex justify-between'><dt>GST</dt><dd>₹{order.tax}</dd></div>
            <div className='flex justify-between border-t pt-2 font-bold text-dark'><dt>Total</dt><dd>₹{order.total}</dd></div>
          </dl>
          <p className={`mt-2 text-sm font-semibold ${order.paymentStatus === 'paid' ? 'text-green-700' : 'text-gray-700'}`}>
            {paymentLabel(order)}
          </p>
          <h3 className='mb-1 mt-5 font-bold text-dark'>Delivering to</h3>
          <p className='text-sm text-gray-700'>{order.customer.name} · {order.customer.phone}</p>
          <p className='text-sm text-gray-700'>{order.address.line}{order.address.landmark && `, near ${order.address.landmark}`}</p>
          {order.note && <p className='mt-2 text-sm italic text-gray-600'>Note: {order.note}</p>}
        </div>
      </div>
    </div>
  )
}

const OrderTracking = () => {
  const { id } = useParams()
  const [phone, setPhone] = useState(() => phoneForOrder(id))
  const [phoneInput, setPhoneInput] = useState('')

  return (
    <div className='min-h-screen bg-secondary py-10'>
      <div className='container mx-auto px-6'>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
          <h1 className='text-3xl font-bold text-dark'>Track Order</h1>
          <Link to='/my-bookings' className='font-semibold text-primary'>All my orders →</Link>
        </div>
        {phone ? (
          <OrderDetails key={phone} id={id} phone={phone} onChangePhone={() => setPhone('')} />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              rememberOrder(id, phoneInput)
              setPhone(phoneInput)
            }}
            className='mx-auto max-w-sm rounded bg-white p-6 shadow'
          >
            <p className='mb-4 text-gray-700'>Enter the phone number used for this order.</p>
            <InputField label='Phone' name='phone' type='tel' value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} required />
            <button type='submit' className='w-full rounded bg-primary px-6 py-3 font-semibold text-white'>Show order</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default OrderTracking
