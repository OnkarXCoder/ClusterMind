import { useState } from "react";
import { Search } from "lucide-react";
import { trackSearch } from "../../services/behavior";
import "./ProductSearch.css";

export default function ProductSearch({ value, onChange, onClear }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    trackSearch(query, { source: "products-page" });
    onChange(query);
  };

  const handleReset = () => {
    setQuery("");
    onClear();
  };

  return (
    <form className="product-search" onSubmit={handleSubmit}>
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search products, brands and more..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
        />
        {(query || value) && (
          <button type="button" className="clear-btn" onClick={handleReset}>
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
