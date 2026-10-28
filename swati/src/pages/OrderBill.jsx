// Printable bill / invoice for one order (route "/orders/:id/bill").
// - Customers: loaded with the phone saved in this browser (or typed in), like the tracking page.
// - Admin: "/orders/:id/bill?admin=1" loads it with the admin login instead.
// "Print / Save as PDF" opens the browser's print window; choose "Save as PDF" there.
// Navbar, footer and buttons have the "no-print" class, so only the bill is printed (see index.css).

import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getToken } from '../api'
import useFetch from '../hooks/useFetch'
import InputField from '../components/InputField'
import { paymentLabel, orderStatusLabel } from '../utils/orderStatus'
import { phoneForOrder, rememberOrder } from '../utils/recentOrders'

const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`
const formatDateTime = (iso) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

const Bill = ({ path, params }) => {
  const { data: order, error, isLoading } = useFetch(path, params)

  if (isLoading) return <p className='py-10 text-center text-gray-700'>Loading bill...</p>
  if (error) return <p className='py-10 text-center text-red-600'>{error.message}</p>

  return (
    <div className='mx-auto max-w-2xl rounded-lg bg-white p-6 shadow sm:p-8 print:max-w-none print:p-0 print:shadow-none'>
      <div className='mb-6 flex flex-wrap items-start justify-between gap-4 border-b pb-4'>
        <div>
          <p className='text-2xl font-bold text-primary'>Fork <span className='text-accent'>&amp; Flame</span></p>
          <p className='text-sm text-gray-600'>Tax invoice / Bill</p>
        </div>
        <div className='text-right text-sm'>
          <p className='font-semibold text-dark'>Order #{order.orderNumber}</p>
          <p className='text-gray-600'>{formatDateTime(order.createdAt)}</p>
          <p className='text-gray-600'>Status: {orderStatusLabel(order.status)}</p>
        </div>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2'>
        <div>
          <p className='mb-1 font-semibold text-dark'>From</p>
          <p>{order.restaurant?.name || 'Restaurant'}</p>
          {order.restaurant?.address && <p className='text-gray-600'>{order.restaurant.address}</p>}
          {order.restaurant?.phone && <p className='text-gray-600'>{order.restaurant.phone}</p>}
        </div>
        <div>
          <p className='mb-1 font-semibold text-dark'>Bill to</p>
          <p>{order.customer.name} · {order.customer.phone}</p>
          <p className='text-gray-600 break-words'>{order.address.line}{order.address.landmark && `, near ${order.address.landmark}`}</p>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <thead className='border-b text-gray-600'>
            <tr><th className='py-2'>Item</th><th className='py-2 text-center'>Qty</th><th className='py-2 text-right'>Price</th><th className='py-2 text-right'>Amount</th></tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.name} className='border-b'>
                <td className='py-2 pr-2'>{item.name}</td>
                <td className='py-2 text-center'>{item.quantity}</td>
                <td className='py-2 text-right'>{rupees(item.price)}</td>
                <td className='py-2 text-right'>{rupees(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className='ml-auto mt-4 max-w-xs space-y-1 text-sm'>
        <div className='flex justify-between'><dt>Item total</dt><dd>{rupees(order.subtotal)}</dd></div>
        {order.discount > 0 && (
          <div className='flex justify-between'><dt>Coupon {order.couponCode}</dt><dd>−{rupees(order.discount)}</dd></div>
        )}
        <div className='flex justify-between'><dt>Delivery fee</dt><dd>{order.deliveryFee ? rupees(order.deliveryFee) : 'FREE'}</dd></div>
        <div className='flex justify-between'><dt>GST (5%)</dt><dd>{rupees(order.tax)}</dd></div>
        <div className='flex justify-between border-t pt-2 text-base font-bold text-dark'><dt>Total</dt><dd>{rupees(order.total)}</dd></div>
        <div className='flex justify-between text-gray-600'><dt>Payment</dt><dd>{paymentLabel(order)}</dd></div>
      </dl>

      <p className='mt-8 text-center text-xs text-gray-500'>Thank you for ordering with Fork &amp; Flame!</p>
    </div>
  )
}

const OrderBill = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const asAdmin = searchParams.get('admin') === '1' && Boolean(getToken())
  const [phone, setPhone] = useState(() => phoneForOrder(id))
  const [phoneInput, setPhoneInput] = useState('')

  return (
    <div className='min-h-screen bg-secondary py-10 print:bg-white print:py-0'>
      <div className='container mx-auto px-6 print:px-0'>
        <div className='no-print mx-auto mb-6 flex max-w-2xl flex-wrap items-center justify-between gap-3'>
          <Link to={asAdmin ? '/admin' : `/orders/${id}`} className='font-semibold text-primary'>← Back</Link>
          {(asAdmin || phone) && (
            <button type='button' onClick={() => window.print()} className='rounded bg-primary px-5 py-2 font-semibold text-white'>
              Print / Save as PDF
            </button>
          )}
        </div>

        {asAdmin ? (
          <Bill path={`/api/orders/${id}`} />
        ) : phone ? (
          <Bill path={`/api/orders/track/${id}`} params={{ phone }} />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              rememberOrder(id, phoneInput)
              setPhone(phoneInput)
            }}
            className='no-print mx-auto max-w-sm rounded bg-white p-6 shadow'
          >
            <p className='mb-4 text-gray-700'>Enter the phone number used for this order.</p>
            <InputField label='Phone' name='phone' type='tel' value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} required />
            <button type='submit' className='w-full rounded bg-primary px-6 py-3 font-semibold text-white'>Show bill</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default OrderBill
