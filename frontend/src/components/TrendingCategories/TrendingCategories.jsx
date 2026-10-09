import "./TrendingCategories.css";
import CategoryCard from "../CategoryCard/CategoryCard";
import { BookOpen, Puzzle, Car } from "lucide-react";
import { useState, useEffect } from "react";

import electronics from "../../assets/categories/electronics.svg";
import fashion from "../../assets/categories/fashion.svg";
import home from "../../assets/categories/home.svg";
import beauty from "../../assets/categories/beauty.svg";
import sports from "../../assets/categories/sports.svg";

const iconMap = { Books: <BookOpen size={28} color="#7C3AED" />, 'Toys & Games': <Puzzle size={28} color="#0F766E" />, Automotive: <Car size={28} color="#2563EB" /> };
const colorMap = { Electronics: "#DBEAFE", Fashion: "#FCE7F3", 'Home & Kitchen': "#DCFCE7", Beauty: "#FCE7F3", Sports: "#FEF3C7", Books: "#EDE9FE", 'Toys & Games': "#CCFBF1", Automotive: "#E0F2FE" };
const imgMap = { Electronics: electronics, Fashion: fashion, 'Home & Kitchen': home, Beauty: beauty, Sports: sports };

function TrendingCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;

    fetch("/api/products/categories")
      .then(r => r.json())
      .then(async (data) => {
        const cats = data?.categories || [];
        const counts = await Promise.all(
          cats.map((name) =>
            fetch(`/api/products?category=${encodeURIComponent(name)}`)
              .then(r => r.json())
              .then(d => [name, d?.count ?? d?.products?.length ?? 0])
              .catch(() => [name, 0])
          )
        );
        const countMap = Object.fromEntries(counts);

        if (!active) return;
        setCategories(cats.map((name) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          items: countMap[name] || 0,
          image: imgMap[name] || undefined,
          icon: iconMap[name] || undefined,
          color: colorMap[name] || "#F1F5F9",
        })));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="dm-card" id="trending-categories">
      <div className="dm-card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Trending Categories</h3>
          <p className="dm-hero-sub">Explore what&apos;s popular right now</p>
        </div>
        <button className="dm-btn dm-btn-outline dm-btn-sm">View All</button>
      </div>
      <div className="dm-card-body">
        <div className="category-grid">
          {categories.map((item, index) => (
            <CategoryCard key={index} category={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrendingCategories;
