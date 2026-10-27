// OrderStatusBadge: coloured pill for a FOOD ORDER status
// (Payment pending, Order placed, Preparing, Out for delivery, Delivered, Cancelled). Prop: status.

import { orderStatusLabel } from '../utils/orderStatus'

const styles = {
  awaiting_payment: 'bg-red-100 text-red-800',
  placed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-yellow-100 text-yellow-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
}

const OrderStatusBadge = ({ status }) => (
  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.placed}`}>
    {orderStatusLabel(status)}
  </span>
)

export default OrderStatusBadge
