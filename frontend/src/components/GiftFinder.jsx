import { Gift, Heart, Search } from 'lucide-react'
import { giftRecipients, matchesGiftRecipient } from './giftRules'

export default function GiftFinder({ products, selected, onSelect }) {
  const recipient = giftRecipients.find((item) => item.key === selected) || giftRecipients[0]
  const suggestions = products
    .filter((product) => matchesGiftRecipient(product, recipient.key))
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 4)

  return (
    <section className="gift-finder">
      <div className="gift-finder-copy">
        <span>
          <Gift size={16} />
          Gift Finder
        </span>
        <h2>Find the right gift faster</h2>
        <p>Choose who you are buying for and ShopSmart will organize matching gift ideas from the catalog.</p>
      </div>

      <div className="gift-recipient-panel">
        <div className="gift-chip-row">
          {giftRecipients.map((item) => (
            <button
              key={item.key}
              type="button"
              className={selected === item.key ? 'active' : ''}
              onClick={() => onSelect(selected === item.key ? '' : item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="gift-suggestions">
          {suggestions.map((product) => (
            <article key={product.id || product._id}>
              <img src={product.image} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <small>{product.category}</small>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="gift-action"
          onClick={() => {
            onSelect(recipient.key)
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <Search size={16} />
          Show gifts for {recipient.label}
          <Heart size={15} />
        </button>
      </div>
    </section>
  )
}
