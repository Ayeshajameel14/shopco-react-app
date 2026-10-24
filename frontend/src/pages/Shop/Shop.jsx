
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";

import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import { useProducts } from "../../context/ProductsContext";
import styles from "./Shop.module.css";

const initialFilters = {
  category: "",
  style: "",
  color: "",
  size: "",
  maxPrice: 300,
};

function Shop() {
  const { products, loading, error } = useProducts();
  const [searchParams] = useSearchParams();

  const searchText = searchParams.get("search") || "";
  const searchQuery = searchText.trim().toLowerCase();

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
      // Search by product name, title, category, or style
      const searchableFields = [
        product.name,
        product.title,
        product.category,
        product.style,
      ];

      const matchesSearch =
        !searchQuery ||
        searchableFields.some(
          (value) =>
            value &&
            String(value).toLowerCase().includes(searchQuery)
        );

      if (!matchesSearch) {
        return false;
      }

      // Category filter
      if (
        filters.category &&
        product.category !== filters.category
      ) {
        return false;
      }

      // Style filter
      if (
        filters.style &&
        product.style !== filters.style
      ) {
        return false;
      }

      // Color filter
      if (
        filters.color &&
        !(product.colors || []).includes(filters.color)
      ) {
        return false;
      }

      // Size filter
      if (
        filters.size &&
        !(product.sizes || []).includes(filters.size)
      ) {
        return false;
      }

      // Maximum price filter
      if (Number(product.price) > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [products, filters, searchQuery]);

  return (
    <main className={styles.shopPage}>
      <div className={styles.container}>
        <Breadcrumb items={[{ label: "Shop" }]} />

        <div className={styles.headerRow}>
          <h1>
            {searchQuery
              ? `Search Results: ${searchText}`
              : "All Products"}
          </h1>

          <button
            type="button"
            className={styles.mobileFilterButton}
            onClick={() =>
              setShowMobileFilters((previous) => !previous)
            }
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>

          <p className={styles.resultCount}>
            Showing {filteredProducts.length} of {products.length} Products
          </p>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
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
              {searchQuery && filteredProducts.length === 0 ? (
                <div>
                  <h2>No matching products found</h2>
                  <p>
                    We couldn't find products matching "{searchText}".
                    Try another product name.
                  </p>
                </div>
              ) : (
                <ProductGrid products={filteredProducts} />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Shop;
