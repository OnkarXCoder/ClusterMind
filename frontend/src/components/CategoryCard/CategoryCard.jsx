import { useNavigate } from "react-router-dom";
import "./CategoryCard.css";

export default function CategoryCard({ category }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products?category=${encodeURIComponent(category.name)}`);
  };

  return (
    <div className="category-card" onClick={handleClick}>
      <div
        className="category-image"
        style={{ background: category.color }}
      >
        {category.image ? (
          <img src={category.image} alt={category.name} />
        ) : (
          category.icon
        )}
      </div>

      <h3>{category.name}</h3>

      <p>{category.items} Products</p>
    </div>
  );
}
