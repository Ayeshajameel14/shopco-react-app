import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./FilterSidebar.module.css";

const categories = ["T-shirts", "Shorts", "Shirts", "Hoodie", "Jeans", "Polos"];
const colors = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#22c55e",
  "#f4a300",
  "#0f4c81",
  "#8b0000",
  "#a3a3a3",
];
const sizes = ["Small", "Medium", "Large", "X-Large", "XX-Large"];
const dressStyles = ["Casual", "Formal", "Party", "Gym"];

function FilterSidebar({ filters, onFilterChange, onClearFilters }) {
  const [openSections, setOpenSections] = useState({
    price: true,
    colors: true,
    size: true,
    dressStyle: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h3>Filters</h3>
        <button onClick={onClearFilters} className={styles.clearButton}>
          Clear All
        </button>
      </div>

      <div className={styles.categoryList}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.categoryItem} ${
              filters.category === category ? styles.activeCategory : ""
            }`}
            onClick={() =>
              onFilterChange(
                "category",
                filters.category === category ? "" : category
              )
            }
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.divider}></div>

      <div className={styles.filterGroup}>
        <button
          className={styles.groupHeader}
          onClick={() => toggleSection("price")}
        >
          <span>Price</span>
          {openSections.price ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSections.price && (
          <div className={styles.priceRange}>
            <input
              type="range"
              min="0"
              max="300"
              value={filters.maxPrice}
              onChange={(e) =>
                onFilterChange("maxPrice", Number(e.target.value))
              }
            />
            <p>Up to ${filters.maxPrice}</p>
          </div>
        )}
      </div>

      <div className={styles.divider}></div>

      <div className={styles.filterGroup}>
        <button
          className={styles.groupHeader}
          onClick={() => toggleSection("colors")}
        >
          <span>Colors</span>
          {openSections.colors ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSections.colors && (
          <div className={styles.colorGrid}>
            {colors.map((color) => (
              <button
                key={color}
                className={`${styles.colorSwatch} ${
                  filters.color === color ? styles.activeColor : ""
                }`}
                style={{ background: color }}
                onClick={() =>
                  onFilterChange("color", filters.color === color ? "" : color)
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.divider}></div>

      <div className={styles.filterGroup}>
        <button
          className={styles.groupHeader}
          onClick={() => toggleSection("size")}
        >
          <span>Size</span>
          {openSections.size ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSections.size && (
          <div className={styles.sizeGrid}>
            {sizes.map((size) => (
              <button
                key={size}
                className={`${styles.sizeButton} ${
                  filters.size === size ? styles.activeSize : ""
                }`}
                onClick={() =>
                  onFilterChange("size", filters.size === size ? "" : size)
                }
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.divider}></div>

      <div className={styles.filterGroup}>
        <button
          className={styles.groupHeader}
          onClick={() => toggleSection("dressStyle")}
        >
          <span>Dress Style</span>
          {openSections.dressStyle ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSections.dressStyle && (
          <div className={styles.categoryList}>
            {dressStyles.map((style) => (
              <button
                key={style}
                className={`${styles.categoryItem} ${
                  filters.style === style ? styles.activeCategory : ""
                }`}
                onClick={() =>
                  onFilterChange("style", filters.style === style ? "" : style)
                }
              >
                {style}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default FilterSidebar;