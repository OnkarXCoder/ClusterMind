import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, onKeyDown, placeholder = 'Search...', className = '' }) {
  return (
    <div className={className} style={{ position: 'relative' }}>
      <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="dm-input"
        style={{ paddingLeft: 36, paddingRight: value ? 32 : 12 }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', padding: 2, borderRadius: '50%', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
