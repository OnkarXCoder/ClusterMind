import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, PackageSearch, Search, ShoppingCart, X } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getProducts } from "../../services/products";
import { getCartCount, subscribeCart } from "../../services/cart";
import "./CategoryProducts.css";

const slugToName = {
  electronics: "Electronics",
  fashion: "Fashion",
  "home-kitchen": "Home & Kitchen",
  beauty: "Beauty",
  sports: "Sports",
  books: "Books",
  "toys-games": "Toys & Games",
  automotive: "Automotive",
  grocery: "Grocery",
};

const SORT_OPTIONS = [
  { id: "popular", label: "Popular" },
  { id: "price-asc", label: "Price Low to High" },
  { id: "price-desc", label: "Price High to Low" },
  { id: "rating", label: "Highest Rated" },
];

export default function CategoryProducts() {
  const { category } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular");
  const [cartCount, setCartCount] = useState(getCartCount());
  const [products, setProducts] = useState([]);

  useEffect(
    () =>
      subscribeCart((cart) =>
        setCartCount(cart.reduce((sum, i) => sum + i.quantity, 0))
      ),
    []
  );

  const categoryName = slugToName[category];

  useEffect(() => {
    let active = true;

    if (!categoryName) {
      setProducts([]);
      return undefined;
    }

    getProducts({ category: categoryName }).then((list) => {
      if (active) setProducts([...list]);
    });

    return () => {
      active = false;
    };
  }, [categoryName]);

  const visible = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => b.reviews - a.reviews);
    }
    return list;
  }, [products, query, sort]);

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ marginLeft: "260px" }}>
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        <div className="category-products-page">

          <div className="cp-head">
            <Link to="/" className="cp-back">
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>

            <div className="cp-title-row">
              <div>
                <h1>{categoryName || "Category"}</h1>
                <p>
                  Explore our best {categoryName || "category"} products
                </p>
              </div>

              <Link to="/cart" className="cp-cart">
                <ShoppingCart size={19} />
                Cart
                {cartCount > 0 && <span className="cp-cart-badge">{cartCount}</span>}
              </Link>
            </div>

            <span className="cp-count">
              {visible.length} product{visible.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="cp-toolbar">
            <div className="cp-search">
              <Search size={18} className="cp-search-icon" />
              <input
                type="text"
                placeholder={`Search ${categoryName || "category"} products...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="cp-search-clear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="cp-sort">
              <label htmlFor="cp-sort-select">Sort by</label>
              <select
                id="cp-sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="cp-empty">
              <PackageSearch size={52} color="#D1D5DB" />
              <h2>No products found</h2>
              <p>
                {query
                  ? `Nothing matches "${query}" in ${categoryName || "this category"}.`
                  : "This category has no products yet."}
              </p>
              <button
                className="cp-empty-btn"
                onClick={() => {
                  setQuery("");
                  setSort("popular");
                }}
              >
                <ArrowLeft size={18} />
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="cp-grid">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
