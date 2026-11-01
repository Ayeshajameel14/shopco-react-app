
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Package,
  AlertCircle,
  Star,
  Tags,
  Plus,
  Pencil,
  X,
  Save,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { useProducts } from "../../../context/ProductsContext";
import styles from "./Products.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const emptyForm = {
  name: "",
  brand: "",
  price: "",
  originalPrice: "",
  discount: "",
  category: "",
  style: "",
  description: "",
  imageUrl: "",
  sizes: "",
  colors: "",
};

function Products() {
  const { loading: authLoading, token } = useAuth();
  const { refreshProducts } = useProducts();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

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
    if (!authLoading) loadProducts();
  }, [authLoading]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
      ),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        String(product.name || "").toLowerCase().includes(query) ||
        String(product.brand || "").toLowerCase().includes(query) ||
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

  function openAddForm() {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      brand: product.brand || "",
      price: product.price ?? "",
      originalPrice: product.originalPrice ?? "",
      discount: product.discount ?? "",
      category: product.category || "",
      style: product.style || "",
      description: product.description || "",
      imageUrl: Array.isArray(product.images)
        ? product.images.join(", ")
        : "",
      sizes: Array.isArray(product.sizes)
        ? product.sizes.join(", ")
        : "",
      colors: Array.isArray(product.colors)
        ? product.colors.join(", ")
        : "",
    });

    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function splitValues(value) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!token) {
      setFormError("Please log in again to continue.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      form.price === ""
    ) {
      setFormError("Product name, price and category are required.");
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setFormError("Please enter a valid price.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      price,
      originalPrice:
        form.originalPrice === "" ? null : Number(form.originalPrice),
      discount:
        form.discount === "" ? null : Number(form.discount),
      category: form.category.trim(),
      style: form.style.trim(),
      description: form.description.trim(),
      images: splitValues(form.imageUrl),
      sizes: splitValues(form.sizes),
      colors: splitValues(form.colors),
    };

    if (
      (payload.originalPrice !== null &&
        (!Number.isFinite(payload.originalPrice) ||
          payload.originalPrice < 0)) ||
      (payload.discount !== null &&
        (!Number.isFinite(payload.discount) ||
          payload.discount < 0))
    ) {
      setFormError("Please enter valid original price and discount values.");
      return;
    }

    const isEditing = Boolean(editingProduct);

    const endpoint = isEditing
      ? `${API_URL}/products/${editingProduct.id}`
      : `${API_URL}/products`;

    setSaving(true);

    try {
      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save product.");
      }

      await Promise.all([
        loadProducts(),
        refreshProducts(),
      ]);

      closeForm();
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

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
            Manage your catalog and product information.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={loadProducts}
            disabled={fetching}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            className={styles.addButton}
            onClick={openAddForm}
          >
            <Plus size={17} />
            Add Product
          </button>
        </div>
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
            <p>Search, edit or add products to your store.</p>
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
              placeholder="Search by name, brand, ID or category..."
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

        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={36} />
            <h3>No products found in the catalog</h3>
            <p>Use Add Product to create your first product.</p>
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
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Original price</th>
                  <th>Rating</th>
                  <th>Sizes</th>
                  <th>Colors</th>
                  <th>Action</th>
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
                              {product.description || "No description"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className={styles.idCell}>
                        {product.id ?? "—"}
                      </td>

                      <td>
                        {product.brand || "—"}
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

                      <td>
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() => openEditForm(product)}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className={styles.modalOverlay}>
          <section
            className={styles.productModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="productFormTitle"
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 id="productFormTitle">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p>Enter the product details below.</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.productForm}>
              <div className={styles.formGrid}>
                <label className={styles.formField}>
                  Product name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Enter product name"
                    required
                  />
                </label>

                <label className={styles.formField}>
                  Brand
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleFormChange}
                    placeholder="e.g. Nike, Adidas, Zara"
                  />
                </label>

                <label className={styles.formField}>
                  Category *
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    placeholder="e.g. T-shirts"
                    required
                  />
                </label>

                <label className={styles.formField}>
                  Price *
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="Enter price"
                    required
                  />
                </label>

                <label className={styles.formField}>
                  Original price
                  <input
                    type="number"
                    name="originalPrice"
                    min="0"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={handleFormChange}
                    placeholder="Optional"
                  />
                </label>

                <label className={styles.formField}>
                  Discount
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    value={form.discount}
                    onChange={handleFormChange}
                    placeholder="Optional"
                  />
                </label>

                <label className={styles.formField}>
                  Style
                  <input
                    name="style"
                    value={form.style}
                    onChange={handleFormChange}
                    placeholder="e.g. Casual"
                  />
                </label>

                <label className={`${styles.formField} ${styles.fullWidth}`}>
                  Image URL
                  <input
                    name="imageUrl"
                    type="text"
                    value={form.imageUrl}
                    onChange={handleFormChange}
                    placeholder="Paste image URL here"
                  />
                  <small>
                    Multiple image URLs can be separated with commas.
                  </small>
                </label>

                {form.imageUrl.trim() && (
                  <div className={`${styles.imagePreview} ${styles.fullWidth}`}>
                    <img
                      src={splitValues(form.imageUrl)[0]}
                      alt="Product preview"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                    <span>Image preview</span>
                  </div>
                )}

                <label className={styles.formField}>
                  Sizes
                  <input
                    name="sizes"
                    value={form.sizes}
                    onChange={handleFormChange}
                    placeholder="Small, Medium, Large"
                  />
                </label>

                <label className={styles.formField}>
                  Colors
                  <input
                    name="colors"
                    value={form.colors}
                    onChange={handleFormChange}
                    placeholder="Black, White, Blue"
                  />
                </label>

                <label className={`${styles.formField} ${styles.fullWidth}`}>
                  Description
                  <textarea
                    name="description"
                    rows="4"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Write product description..."
                  />
                </label>
              </div>

              {formError && (
                <div className={styles.formError} role="alert">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Save Product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default Products;
