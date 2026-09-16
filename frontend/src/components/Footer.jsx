import { Facebook, Instagram, Linkedin, ShoppingBag, Twitter, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'

const socials = [Twitter, Facebook, Instagram, Linkedin, Youtube]

export default function Footer() {
  return (
    <footer className="mt-8 bg-slate-950 text-slate-300">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="block w-full bg-slate-900 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
      >
        Back to top
      </button>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <a href="#top" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500">
              <ShoppingBag className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold text-white">ShopSmart</span>
          </a>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            AI-powered personalized shopping with intelligent recommendations,
            targeted offers, and customer behaviour insights.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map((Icon, i) => (
              <a
                key={i}
                href="#top"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-white hover:text-white"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Shop</h3>
          <ul className="mt-4 space-y-2.5">
            {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'].map((c) => (
              <li key={c}>
                <a href="#products" className="text-sm text-slate-400 transition hover:text-white">
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Help</h3>
          <ul className="mt-4 space-y-2.5">
            {['Track Your Order', 'Returns & Refunds', 'Shipping Info', 'FAQs', 'Contact Us'].map((l) => (
              <li key={l}>
                <a href="#top" className="text-sm text-slate-400 transition hover:text-white">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Account</h3>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/login" className="text-sm text-slate-400 transition hover:text-white">
                Sign In
              </Link>
            </li>
            {['Your Orders', 'Your Wishlist', 'Gift Cards', 'Customer Service'].map((l) => (
              <li key={l}>
                <a href="#top" className="text-sm text-slate-400 transition hover:text-white">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>Copyright {new Date().getFullYear()} ShopSmart. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#top" className="transition hover:text-white">Privacy Policy</a>
            <a href="#top" className="transition hover:text-white">Terms of Service</a>
            <a href="#top" className="transition hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
