import { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import { products } from "../../data/products";
import styles from "./Shop.module.css";

const initialFilters = {
  category: "",
  style: "",
  color: "",
  size: "",
  maxPrice: 300,
};

function Shop() {
  const [filters, setFilters] = useState(initialFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      if (filters.style && product.style !== filters.style) {
        return false;
      }

      if (filters.color && !product.colors.includes(filters.color)) {
        return false;
      }

      if (filters.size && !product.sizes.includes(filters.size)) {
        return false;
      }

      if (product.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <main className={styles.shopPage}>
      <div className={styles.container}>
        <Breadcrumb items={[{ label: "Shop" }]} />

        <div className={styles.headerRow}>
          <h1>All Products</h1>

          <button
            className={styles.mobileFilterButton}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>

          <p className={styles.resultCount}>
            Showing {filteredProducts.length} of {products.length} Products
          </p>
        </div>

        <div className={styles.layout}>
          <div
            className={`${styles.sidebarWrapper} ${
              showMobileFilters ? styles.showSidebar : ""
            }`}
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className={styles.gridWrapper}>
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Shop;