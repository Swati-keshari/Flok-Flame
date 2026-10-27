// Order status helpers shared by the tracking page, My Orders page and admin Orders tab.
// - ORDER_STEPS: the 4 steps shown on the tracking page.
// - orderStatusLabel(): human-friendly name for a status.
// - isActiveOrder(): true while the order is still in progress (used to keep refreshing).
// - paymentLabel(): "Cash on Delivery", "Paid online ✓", "Refunded", etc.

export const ORDER_STEPS = [
  { status: 'placed', label: 'Order placed', hint: 'Waiting for the restaurant to accept' },
  { status: 'preparing', label: 'Preparing', hint: 'Your food is being cooked' },
  { status: 'out_for_delivery', label: 'Out for delivery', hint: 'The delivery partner is on the way' },
  { status: 'delivered', label: 'Delivered', hint: 'Enjoy your meal!' },
]

const otherLabels = { cancelled: 'Cancelled', awaiting_payment: 'Payment pending' }

export const orderStatusLabel = (status) =>
  otherLabels[status] || ORDER_STEPS.find((s) => s.status === status)?.label || status

export const isActiveOrder = (status) => ['awaiting_payment', 'placed', 'preparing', 'out_for_delivery'].includes(status)

export const paymentLabel = (order) => {
  if (order.paymentMethod !== 'online') return 'Cash on Delivery'
  return {
    paid: 'Paid online ✓',
    refund_needed: 'Paid online · refund in progress',
    refunded: 'Refunded',
  }[order.paymentStatus] || 'Online payment pending'
}
