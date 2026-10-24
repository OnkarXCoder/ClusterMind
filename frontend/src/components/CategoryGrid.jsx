import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Dumbbell, Flower2, Home as HomeIcon, Laptop, Shirt } from 'lucide-react'
import { useState, useEffect } from 'react'
import { MAIN_CATEGORY_NAMES } from '../data/categoryCatalog'
import { resolveCategoryImage } from '../utils/productImages'

const iconMap = { Electronics: Laptop, Fashion: Shirt, 'Home & Kitchen': HomeIcon, Beauty: Flower2, Sports: Dumbbell, Books: BookOpen }
const colorMap = { Electronics: 'from-indigo-500 to-blue-500', Fashion: 'from-rose-500 to-pink-500', 'Home & Kitchen': 'from-emerald-500 to-teal-500', Beauty: 'from-fuchsia-500 to-purple-500', Sports: 'from-orange-500 to-amber-500', Books: 'from-cyan-500 to-sky-500' }
const imgMap = { Electronics: '/products/samsung-s24.jpg', Fashion: '/products/fashion-dress.jpg', 'Home & Kitchen': '/products/sofa.jpg', Beauty: '/products/beauty.jpg', Sports: '/products/football.jpg', Books: '/products/books.jpg' }

export default function CategoryGrid({ onSelect }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('/api/products/categories')
      .then(r => r.json())
      .then(data => {
        const cats = [...new Set([...MAIN_CATEGORY_NAMES, ...(data?.categories || [])])]
        setCategories(cats.map(name => ({
          name,
          icon: iconMap[name] || Laptop,
          img: imgMap[name] || resolveCategoryImage(name),
          color: colorMap[name] || 'from-slate-500 to-gray-500',
        })))
      })
      .catch(() => {
        setCategories(MAIN_CATEGORY_NAMES.map(name => ({
          name,
          icon: iconMap[name],
          img: imgMap[name] || resolveCategoryImage(name),
          color: colorMap[name],
        })))
      })
  }, [])

  if (categories.length === 0) return null

  return (
    <section id="categories" className="storefront-section mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">Curated for you</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Shop by Category</h2>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((c, i) => (
          <motion.button
            key={c.name}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ y: -6 }}
            onClick={() => onSelect(c.name)}
            className="storefront-category group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm shadow-slate-200/70 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-300/60"
          >
            <div className="relative aspect-square overflow-hidden bg-slate-100">
              <img
                src={c.img}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}>
                  <c.icon className="h-4 w-4 text-white" />
                </span>
                <span className="text-sm font-semibold text-white">{c.name}</span>
              </div>
              <ArrowRight className="absolute right-3 top-3 h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
