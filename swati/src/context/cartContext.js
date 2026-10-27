// Creates the CartContext and the useCart() hook.
// Any component can call useCart() to read the cart or add/remove items.
// The actual cart logic lives in CartProvider.jsx. (They are separate files because
// React Fast Refresh wants component files to export only components.)

import { createContext, useContext } from 'react'

export const CartContext = createContext(null)

export const useCart = () => {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart must be used inside <CartProvider>')
  return cart
}
