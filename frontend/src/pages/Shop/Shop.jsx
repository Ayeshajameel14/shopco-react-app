
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

  const activeFilter = searchParams.get("filter") || "all";

  const [filters, setFilters] = useState(initialFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const pageTitle = {
    all: "All Products",
    sale: "On Sale",
    new: "New Arrivals",
    brands: "Shop by Brands",
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // On Sale: Products with a discount or reduced original price
    if (activeFilter === "sale") {
      result = result.filter((product) => {
        const hasDiscount = Number(product.discount) > 0;

        const hasReducedPrice =
          Number(product.originalPrice) > Number(product.price) &&
          Number(product.originalPrice) > 0;

        return hasDiscount || hasReducedPrice;
      });
    }

    // New Arrivals: Sort products by newest creation date
    if (activeFilter === "new") {
      result = result
        .filter((product) => product.createdAt)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    }

    // Brands: Only products with a brand
    if (activeFilter === "brands") {
      result = result.filter(
        (product) =>
          product.brand &&
          product.brand.trim() !== ""
      );
    }

    // Search by product name, brand, category, or style
    if (searchQuery) {
      result = result.filter((product) => {
        const searchableFields = [
          product.name,
          product.title,
          product.brand,
          product.category,
          product.style,
        ];

        return searchableFields.some(
          (value) =>
            value &&
            String(value).toLowerCase().includes(searchQuery)
        );
      });
    }

    // Category filter
    if (filters.category) {
      result = result.filter(
        (product) => product.category === filters.category
      );
    }

    // Style filter
    if (filters.style) {
      result = result.filter(
        (product) => product.style === filters.style
      );
    }

    // Color filter
    if (filters.color) {
      result = result.filter((product) =>
        (product.colors || []).includes(filters.color)
      );
    }

    // Size filter
    if (filters.size) {
      result = result.filter((product) =>
        (product.sizes || []).includes(filters.size)
      );
    }

    // Maximum price filter
    result = result.filter(
      (product) => Number(product.price) <= filters.maxPrice
    );

    // Show only the latest 8 products in New Arrivals
    if (activeFilter === "new") {
      result = result.slice(0, 8);
    }

    return result;
  }, [products, filters, searchQuery, activeFilter]);

  const heading = searchQuery
    ? `Search Results: ${searchText}`
    : pageTitle[activeFilter] || "All Products";

  return (
    <main className={styles.shopPage}>
      <div className={styles.container}>
        <Breadcrumb items={[{ label: heading }]} />

        <div className={styles.headerRow}>
          <h1>{heading}</h1>

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
              {filteredProducts.length === 0 ? (
                <div>
                  <h2>
                    {searchQuery
                      ? "No matching products found"
                      : "No products found"}
                  </h2>

                  <p>
                    {searchQuery
                      ? `We couldn't find products matching "${searchText}". Try another product name.`
                      : "There are currently no products in this section."}
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
