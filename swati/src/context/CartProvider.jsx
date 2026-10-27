// CartProvider: holds the food cart for the whole app (wrapped around everything in App.jsx).
// State: { restaurant: { _id, name } | null, items: [{ menuItem, name, price, isVeg, quantity }] }
// Gives: restaurant, items, count, subtotal, quantityOf(), addItem(), decreaseItem(),
// removeItem(), clearCart() — read them with useCart().
// The cart is saved in localStorage so it survives a page refresh.

import { useEffect, useMemo, useState } from 'react'
import { CartContext } from './cartContext'

const STORAGE_KEY = 'cart'
const emptyCart = { restaurant: null, items: [] }

const loadCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return saved?.items?.length ? saved : emptyCart
  } catch {
    return emptyCart
  }
}

// One cart per restaurant at a time, like most food delivery apps.
// Prices here are only for display; the server recalculates the real bill.
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadCart)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)) } catch { /* storage unavailable */ }
  }, [cart])

  const value = useMemo(() => {
    const quantityOf = (menuItemId) => cart.items.find((i) => i.menuItem === menuItemId)?.quantity || 0

    // Returns false if the user refused to drop a cart from another restaurant
    const addItem = (restaurant, item) => {
      if (cart.restaurant && cart.restaurant._id !== restaurant._id) {
        const ok = window.confirm(
          `Your cart has items from ${cart.restaurant.name}. Start a new cart with ${restaurant.name}?`
        )
        if (!ok) return false
        setCart({ restaurant: { _id: restaurant._id, name: restaurant.name }, items: [{ ...item, quantity: 1 }] })
        return true
      }
      setCart((prev) => {
        const exists = prev.items.some((i) => i.menuItem === item.menuItem)
        return {
          restaurant: { _id: restaurant._id, name: restaurant.name },
          items: exists
            ? prev.items.map((i) => (i.menuItem === item.menuItem ? { ...i, quantity: Math.min(i.quantity + 1, 50) } : i))
            : [...prev.items, { ...item, quantity: 1 }],
        }
      })
      return true
    }

    const decreaseItem = (menuItemId) => {
      setCart((prev) => {
        const items = prev.items
          .map((i) => (i.menuItem === menuItemId ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0)
        return items.length ? { ...prev, items } : emptyCart
      })
    }

    const removeItem = (menuItemId) => {
      setCart((prev) => {
        const items = prev.items.filter((i) => i.menuItem !== menuItemId)
        return items.length ? { ...prev, items } : emptyCart
      })
    }

    const clearCart = () => setCart(emptyCart)

    return {
      restaurant: cart.restaurant,
      items: cart.items,
      count: cart.items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      quantityOf,
      addItem,
      decreaseItem,
      removeItem,
      clearCart,
    }
  }, [cart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export default CartProvider
