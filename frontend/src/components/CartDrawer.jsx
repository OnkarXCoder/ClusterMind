import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext'

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

export default function CartDrawer() {
  const { items, count, total, isOpen, setIsOpen, updateQty, removeItem } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <ShoppingCart className="h-5 w-5 text-orange-500" />
                Your Cart
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {count}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close cart"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <ShoppingCart className="h-16 w-16 text-slate-300" />
                <p className="font-semibold text-slate-700">Your cart is empty</p>
                <p className="text-sm text-slate-500">
                  Add some products and they will show up here.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 border-b border-slate-100 py-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <h3 className="line-clamp-2 text-sm font-medium text-slate-800">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {formatPrice(item.price)}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 rounded-full border border-slate-300 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              aria-label="Decrease quantity"
                              className="p-0.5 text-slate-600 transition hover:text-slate-900"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-5 text-center text-sm font-semibold text-slate-900">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              aria-label="Increase quantity"
                              className="p-0.5 text-slate-600 transition hover:text-slate-900"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="rounded-full p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Subtotal</span>
                    <span className="text-xl font-bold text-slate-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-700">
                    Free delivery on eligible orders.
                  </p>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-full bg-amber-400 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-500"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
