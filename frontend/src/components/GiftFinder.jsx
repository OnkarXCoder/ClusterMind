import { Gift, Heart, Search } from 'lucide-react'
import { giftRecipients, rankGiftsForRecipient, resolveRecipientKey } from './giftRules'

export default function GiftFinder({ products, selected, onSelect }) {
  const activeKey = resolveRecipientKey(selected) || giftRecipients[0].key
  const recipient = giftRecipients.find((item) => item.key === activeKey) || giftRecipients[0]
  const suggestions = rankGiftsForRecipient(products, recipient.key, 4)

  return (
    <section className="gift-finder">
      <div className="gift-finder-copy">
        <span>
          <Gift size={16} />
          Gift Finder
        </span>
        <h2>Find the right gift faster</h2>
        <p>Choose who you are buying for and ShopSmart will organize matching gift ideas from the catalog.</p>
        <div className="gift-finder-note">
          <span className="gift-finder-note-dot" />
          Curated picks for every kind of connection
        </div>
      </div>

      <div className="gift-recipient-panel">
        <div className="gift-chip-row">
          {giftRecipients.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeKey === item.key ? 'active' : ''}
              aria-pressed={activeKey === item.key}
              onClick={() => onSelect(activeKey === item.key ? '' : item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="gift-suggestions-heading">
          <span>Trending for {recipient.label}</span>
          <small>{suggestions.length} handpicked ideas</small>
        </div>

        <div className="gift-suggestions">
          {suggestions.map((product) => (
            <article key={product.id || product._id}>
              <div className="gift-suggestion-image">
                <img src={product.image} alt={product.name} />
                <span>Top pick</span>
              </div>
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
