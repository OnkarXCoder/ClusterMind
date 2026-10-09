/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const addToCart = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { ...product, qty }]
    })
    setIsOpen(true)
  }, [])

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      return
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
  }, [])

  const removeItem = useCallback(
    (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
    []
  )

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const total = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items])

  const value = useMemo(
    () => ({ items, count, total, isOpen, setIsOpen, addToCart, updateQty, removeItem }),
    [items, count, total, isOpen, addToCart, removeItem, updateQty]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
