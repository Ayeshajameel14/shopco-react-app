
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Package,
  AlertCircle,
  Star,
  Tags,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import styles from "./Products.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Products() {
  const { loading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    setFetching(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to load products.");
      }

      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadProducts();
    }
  }, [authLoading]);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        String(product.name || "").toLowerCase().includes(query) ||
        String(product.category || "").toLowerCase().includes(query) ||
        String(product.id ?? "").includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const totalCategories = categories.length - 1;

  const averagePrice = products.length
    ? products.reduce(
        (total, product) => total + (Number(product.price) || 0),
        0
      ) / products.length
    : 0;

  if (authLoading || fetching) {
    return (
      <section className={styles.page}>
        <div className={styles.stateMessage}>
          <RefreshCw size={20} className={styles.spin} />
          Loading products...
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>STORE MANAGEMENT</p>
          <h1>Products</h1>
          <p className={styles.subtitle}>
            Browse your catalog and review product information.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={loadProducts}
          disabled={fetching}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={loadProducts}>
            Try again
          </button>
        </div>
      )}

      <section className={styles.summary}>
        <article className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.purpleIcon}`}>
            <Package size={22} />
          </div>
          <div>
            <span>Total products</span>
            <strong>{products.length}</strong>
            <small>Products in your catalog</small>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.blueIcon}`}>
            <Tags size={22} />
          </div>
          <div>
            <span>Categories</span>
            <strong>{totalCategories}</strong>
            <small>Unique product categories</small>
          </div>
        </article>

        <article className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.greenIcon}`}>
            <Star size={22} />
          </div>
          <div>
            <span>Average price</span>
            <strong>${averagePrice.toFixed(2)}</strong>
            <small>Across all listed products</small>
          </div>
        </article>
      </section>

      <section className={styles.productsPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Product catalog</h2>
            <p>Search products or filter by category.</p>
          </div>

          <span className={styles.resultCount}>
            {filteredProducts.length} products
          </span>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="search"
              placeholder="Search by name, ID or category..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className={styles.categoryFilter}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by category"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All categories" : category}
              </option>
            ))}
          </select>
        </div>

        {error && products.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={34} />
            <h3>Products could not be loaded</h3>
            <p>Check that your backend is running, then try again.</p>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={36} />
            <h3>No products found in the catalog</h3>
            <p>Products from your database will appear here.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={34} />
            <h3>No matching products</h3>
            <p>Try a different name or category.</p>
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Product ID</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Original price</th>
                  <th>Rating</th>
                  <th>Sizes</th>
                  <th>Colors</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const image = Array.isArray(product.images)
                    ? product.images.find(
                        (item) =>
                          typeof item === "string" && item.trim()
                      )
                    : "";

                  return (
                    <tr key={product._id || product.id}>
                      <td>
                        <div className={styles.productCell}>
                          <div className={styles.productImage}>
                            {image ? (
                              <img
                                src={image}
                                alt={product.name || "Product"}
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <Package size={23} />
                            )}
                          </div>

                          <div className={styles.productInfo}>
                            <strong>{product.name || "Unnamed product"}</strong>
                            <span>
                              {product.description
                                ? product.description
                                : "No description"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className={styles.idCell}>
                        {product.id ?? "—"}
                      </td>

                      <td>
                        <span className={styles.categoryBadge}>
                          {product.category || "Uncategorized"}
                        </span>
                      </td>

                      <td className={styles.priceCell}>
                        ${Number(product.price || 0).toFixed(2)}
                      </td>

                      <td className={styles.originalPrice}>
                        {product.originalPrice != null
                          ? `$${Number(product.originalPrice).toFixed(2)}`
                          : "—"}
                      </td>

                      <td>
                        <span className={styles.rating}>
                          <Star size={14} fill="currentColor" />
                          {Number(product.rating || 0).toFixed(1)}
                        </span>
                        <span className={styles.reviews}>
                          ({Number(product.reviewsCount || 0)})
                        </span>
                      </td>

                      <td>
                        <span className={styles.optionText}>
                          {product.sizes?.length
                            ? product.sizes.join(", ")
                            : "—"}
                        </span>
                      </td>

                      <td>
                        <span className={styles.optionText}>
                          {product.colors?.length
                            ? product.colors.join(", ")
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default Products;
