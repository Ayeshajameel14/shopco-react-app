
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import StarRating from "../../components/StarRating/StarRating";
import QuantitySelector from "../../components/QuantitySelector/QuantitySelector";
import ProductGrid from "../../components/ProductGrid/ProductGrid";

import { useProducts } from "../../context/ProductsContext";
import { useCart } from "../../context/CartContext";
import styles from "./ProductDetails.module.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();

  // Find product using data received from the backend API
  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  // Get four other products for the related products section
  const relatedProducts = products
    .filter((item) => String(item.id) !== String(id))
    .slice(0, 4);

  if (loading) {
    return (
      <main className={styles.notFound}>
        <h2>Loading product...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.notFound}>
        <h2>Unable to load product</h2>
        <p>{error}</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className={styles.notFound}>
        <h2>Product not found</h2>
        <Link to="/shop">Back to Shop</Link>
      </main>
    );
  }

  return (
    <ProductDetailsContent
      key={product.id}
      product={product}
      relatedProducts={relatedProducts}
      addToCart={addToCart}
      navigate={navigate}
    />
  );
}

function ProductDetailsContent({
  product,
  relatedProducts,
  addToCart,
  navigate,
}) {
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ""
  );

  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || ""
  );

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAdded(true);
  };

  return (
    <main className={styles.productPage}>
      <div className={styles.container}>
        <Breadcrumb
          items={[
            { label: "Shop", link: "/shop" },
            { label: product.name },
          ]}
        />

        <div className={styles.topSection}>
          <div className={styles.imageWrapper}>
            <img src={product.images?.[0]} alt={product.name} />
          </div>

          <div className={styles.info}>
            <h1>{product.name}</h1>

            <StarRating
              rating={product.rating}
              reviewsCount={product.reviewsCount}
            />

            <div className={styles.priceRow}>
              <span className={styles.price}>
                ${product.price}
              </span>

              {product.originalPrice && (
                <span className={styles.originalPrice}>
                  ${product.originalPrice}
                </span>
              )}

              {product.discount && (
                <span className={styles.discountBadge}>
                  -{product.discount}%
                </span>
              )}
            </div>

            <p className={styles.description}>
              {product.description}
            </p>

            <div className={styles.divider}></div>

            <div className={styles.optionGroup}>
              <p className={styles.optionLabel}>Select Colors</p>

              <div className={styles.colorRow}>
                {(product.colors || []).map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select color ${color}`}
                    className={`${styles.colorSwatch} ${
                      selectedColor === color
                        ? styles.activeColor
                        : ""
                    }`}
                    style={{ background: color }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Check size={16} color="#ffffff" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.optionGroup}>
              <p className={styles.optionLabel}>Choose Size</p>

              <div className={styles.sizeRow}>
                {(product.sizes || []).map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`${styles.sizeButton} ${
                      selectedSize === size
                        ? styles.activeSize
                        : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.actionRow}>
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => setQuantity((q) => q + 1)}
                onDecrease={() =>
                  setQuantity((q) => Math.max(1, q - 1))
                }
              />

              <button
                type="button"
                className={styles.addToCartButton}
                onClick={handleAddToCart}
              >
                {added ? "Added to Cart ✓" : "Add to Cart"}
              </button>
            </div>

            {added && (
              <button
                type="button"
                className={styles.viewCartButton}
                onClick={() => navigate("/cart")}
              >
                View Cart
              </button>
            )}
          </div>
        </div>

        <div className={styles.relatedSection}>
          <h2>YOU MIGHT ALSO LIKE</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
