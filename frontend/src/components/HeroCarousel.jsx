import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    badge: 'AI matched deals',
    title: 'Premium Tech Deals',
    sub: 'Save on laptops, phones, audio gear and connected essentials selected from live shopping patterns.',
    cta: 'Shop Electronics',
    category: 'Electronics',
    image: '/products/macbook.jpg',
    from: 'from-slate-950',
    to: 'to-indigo-800',
  },
  {
    id: 2,
    badge: 'New season',
    title: 'Fresh Fashion Finds',
    sub: 'Curated styles, footwear and accessories for everyday confidence.',
    cta: 'Shop Fashion',
    category: 'Fashion',
    image: '/products/nike-shoes.jpg',
    from: 'from-rose-700',
    to: 'to-orange-600',
  },
  {
    id: 3,
    badge: 'Home upgrade',
    title: 'Kitchen Essentials',
    sub: 'Appliances and home picks selected for smarter daily living.',
    cta: 'Shop Home',
    category: 'Home & Kitchen',
    image: '/products/mixer.jpg',
    from: 'from-emerald-700',
    to: 'to-teal-700',
  },
]

export default function HeroCarousel({ onShop }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)
  const next = () => setIndex((i) => (i + 1) % slides.length)

  const slide = slides[index]

  return (
    <section className="storefront-hero-wrap mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
      <div className="storefront-hero relative h-[23rem] overflow-hidden rounded-3xl sm:h-[27rem] lg:h-[30rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`storefront-hero-slide absolute inset-0 flex items-center bg-gradient-to-br ${slide.from} ${slide.to}`}
          >
            <div className="storefront-hero-copy relative z-10 max-w-xl p-7 sm:p-12 lg:p-16">
              <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-white backdrop-blur-sm">
                {slide.badge}
              </span>
              <h2 className="mt-5 max-w-lg text-3xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {slide.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/80 sm:text-base">
                {slide.sub}
              </p>
              <button
                type="button"
                onClick={() => onShop(slide.category)}
                className="mt-7 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-amber-50"
              >
                {slide.cta}
              </button>
            </div>
            <img
              src={slide.image}
              alt={slide.title}
              className="storefront-hero-image pointer-events-none absolute right-0 top-0 h-full w-[58%] object-cover opacity-95"
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? 'w-8 bg-white' : 'w-2.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
