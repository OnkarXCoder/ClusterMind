import "./CategoryList.css";
import { CATEGORY_CATALOG } from "../../data/categoryCatalog";

const subcategoriesFor = (category) =>
  CATEGORY_CATALOG.find((item) => item.name === category)?.subcategories || [];

export default function CategoryList({
  categories,
  selected,
  selectedSubcategory,
  onSelect,
  onSubcategorySelect,
}) {
  const subcategories = subcategoriesFor(selected);

  return (
    <div className="category-list-wrap">
      <div className="category-list">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-chip ${selected === category || (category === "All Products" && selected === "All") ? "active" : ""}`}
            onClick={() => {
              onSelect(category);
              onSubcategorySelect?.("");
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {subcategories.length > 0 && (
        <div className="subcategory-list">
          {subcategories.map((subcategory) => (
            <button
              key={subcategory}
              className={`subcategory-chip ${selectedSubcategory === subcategory ? "active" : ""}`}
              onClick={() => onSubcategorySelect?.(selectedSubcategory === subcategory ? "" : subcategory)}
            >
              {subcategory}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
