// siteInfo.js — the restaurant's contact details, in ONE place.
// Used by the Contact section (home page) and the Footer, so they always match.
// To change the address, phone, email or hours, edit only this file.

export const siteInfo = {
  address: 'Shop 1, Raj Nagar District Centre, Ghaziabad, Uttar Pradesh 201002',
  phone: '+91 87938 47572',
  email: 'info@forkflame.com',
  // Same as the Fork & Flame opening hours used for online orders and table bookings
  hours: [{ days: 'Every day', time: '5:00 PM – 11:00 PM' }],
}

// "tel:" link needs the number without spaces
export const phoneLink = `tel:${siteInfo.phone.replace(/\s/g, '')}`
