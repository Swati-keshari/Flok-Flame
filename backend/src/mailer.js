// =============================================================
// mailer.js — sends emails to customers (order placed, out for delivery,
// delivered, cancelled, table booking received / confirmed / cancelled).
// Uses Gmail (or any SMTP server) when SMTP_USER and SMTP_PASS are in .env.
// Without them, the email is only printed in the backend terminal, so
// everything still works on a laptop without setting up email.
// Emails are sent in the background: a mail problem never stops an order.
// Plain-text emails only, so customer-typed text can't inject HTML.
// =============================================================

import nodemailer from 'nodemailer'

const emailEnabled = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)

let transport = null
const getTransport = () => {
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transport
}

const send = (to, subject, text) => {
  if (!to) return
  if (process.env.NODE_ENV === 'test') return
  if (!emailEnabled()) {
    console.log(`[email not sent - SMTP not set up] to ${to}: ${subject}`)
    return
  }
  getTransport()
    .sendMail({ from: process.env.MAIL_FROM || `Fork & Flame <${process.env.SMTP_USER}>`, to, subject, text })
    .catch((err) => console.error(`[email failed] to ${to}: ${err.message}`))
}

const siteUrl = () => process.env.CLIENT_URL || 'http://localhost:5173'
const itemsText = (order) => order.items.map((i) => `  - ${i.name} x ${i.quantity} = Rs ${i.price * i.quantity}`).join('\n')
const restaurantName = (order) => order.restaurant?.name || 'the restaurant'

const orderMessages = {
  placed: (o) => [
    `Order #${o.orderNumber} received`,
    `Hi ${o.customer.name},\n\nThank you! ${restaurantName(o)} has received your order.\n\n${itemsText(o)}\n\nTotal: Rs ${o.total} (${o.paymentMethod === 'online' ? 'paid online' : 'cash on delivery'})\nDelivering to: ${o.address.line}`,
  ],
  preparing: (o) => [`Order #${o.orderNumber} is being prepared`, `Hi ${o.customer.name},\n\n${restaurantName(o)} has accepted your order and is cooking it now.`],
  out_for_delivery: (o) => [`Order #${o.orderNumber} is on the way`, `Hi ${o.customer.name},\n\nYour food has left ${restaurantName(o)} and is on the way to you.`],
  delivered: (o) => [
    `Order #${o.orderNumber} delivered - enjoy your meal!`,
    `Hi ${o.customer.name},\n\nYour order has been delivered. Enjoyed it? Rate it here:\n${siteUrl()}/orders/${o._id}`,
  ],
  cancelled: (o) => [
    `Order #${o.orderNumber} cancelled`,
    `Hi ${o.customer.name},\n\nYour order has been cancelled.${o.paymentStatus === 'refund_needed' ? ' Your online payment will be refunded.' : ''}`,
  ],
}

// Email the customer about their order's current status
export const emailOrderStatus = (order) => {
  const make = orderMessages[order.status]
  if (!make) return
  const [subject, body] = make(order)
  send(order.customer.email, `Fork & Flame: ${subject}`, `${body}\n\nTrack your order: ${siteUrl()}/orders/${order._id}\n\n- Fork & Flame`)
}

const bookingMessages = {
  pending: 'We have received your table booking. We will confirm it soon.',
  confirmed: 'Your table booking is CONFIRMED. See you soon!',
  cancelled: 'Your table booking has been cancelled.',
}

// Email the customer about their table booking's current status
export const emailBookingStatus = (booking) => {
  const message = bookingMessages[booking.status]
  if (!message) return
  const place = booking.restaurant?.name || 'Fork & Flame'
  send(
    booking.email,
    `${place}: table booking ${booking.status}`,
    `Hi ${booking.fullname},\n\n${message}\n\nPlace: ${place}\nDate: ${booking.date}\nTime: ${booking.time}\nGuests: ${booking.partySize}\n\n- Fork & Flame`
  )
}
