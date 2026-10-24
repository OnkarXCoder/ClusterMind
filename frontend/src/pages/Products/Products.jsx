import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import CategoryList from "../../components/CategoryList/CategoryList";
import ProductSearch from "../../components/ProductSearch/ProductSearch";
import ProductFilter from "../../components/ProductFilter/ProductFilter";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import {
  getCategories,
  getBrands,
  getProducts,
} from "../../services/products";
import { trackSearch } from "../../services/behavior";
import "./Products.css";

const emptyFilters = {
  brands: [],
  price: "",
  ratings: [],
  availability: "",
};

export default function Products() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [category, setCategory] = useState(searchParams.get("category") || "All Products");
  const [subcategory, setSubcategory] = useState("");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState(emptyFilters);
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "All Products");
    setSubcategory("");
  }, [searchParams]);

  useEffect(() => {
    const term = searchParams.get("q") || "";
    if (term.trim()) {
      trackSearch(term, { source: "products-url" });
    }
  }, [searchParams]);

  useEffect(() => {
    const term = query.trim();
    if (!term) return undefined;
    const timeout = setTimeout(() => {
      trackSearch(term, { source: "products-live-search", category });
    }, 900);
    return () => clearTimeout(timeout);
  }, [query, category]);

  useEffect(() => {
    let active = true;

    Promise.all([getCategories(), getBrands()]).then(([categoryList, brandList]) => {
      if (!active) return;
      setCategories(categoryList);
      setBrands(brandList);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    getProducts({
        search: query,
        category,
        subcategory,
        ...filters,
      }).then((list) => {
        if (active) setProducts(list);
      });

    return () => {
      active = false;
    };
  }, [query, category, subcategory, filters]);

  const clearAll = () => {
    setFilters(emptyFilters);
    setQuery("");
    setCategory("All Products");
    setSubcategory("");
  };

  return (
    <>
      <Sidebar />

      <div style={{ marginLeft: "260px" }}>
        <Navbar />

        <div className="products-page">

          <div className="products-head">
            <h1>Products</h1>
            <span>{products.length} products found</span>
          </div>

          <CategoryList
            categories={categories}
            selected={category}
            selectedSubcategory={subcategory}
            onSelect={setCategory}
            onSubcategorySelect={setSubcategory}
          />

          <div className="products-toolbar">
            <ProductSearch
              value={query}
              onChange={setQuery}
              onClear={() => setQuery("")}
            />

            <button
              className="filter-toggle"
              onClick={() => setShowFilter(!showFilter)}
            >
              <SlidersHorizontal size={18} />
              Filters
              {showFilter && <X size={16} />}
            </button>
          </div>

          <div className="products-layout">
            <div className={showFilter ? "filter-col visible" : "filter-col"}>
              <ProductFilter
                brands={brands}
                filters={filters}
                onFilterChange={setFilters}
                onClear={clearAll}
              />
            </div>

            <ProductGrid products={products} />
          </div>

        </div>
      </div>
    </>
  );
}
