import { Link } from "react-router-dom";
import StarRating from "../StarRating/StarRating";
import styles from "./ProductCard.module.css";

function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={product.images[0]} alt={product.name} />
      </div>

      <h3 className={styles.name}>{product.name}</h3>

      <StarRating rating={product.rating} reviewsCount={product.reviewsCount} />

      <div className={styles.priceRow}>
        <span className={styles.price}>${product.price}</span>

        {product.originalPrice && (
          <span className={styles.originalPrice}>
            ${product.originalPrice}
          </span>
        )}

        {product.discount && (
          <span className={styles.discountBadge}>-{product.discount}%</span>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;