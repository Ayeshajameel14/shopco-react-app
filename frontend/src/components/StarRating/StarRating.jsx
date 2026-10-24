import { Star, StarHalf } from "lucide-react";
import styles from "./StarRating.module.css";

function StarRating({ rating, reviewsCount }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={styles.ratingWrapper}>
      <div className={styles.stars}>
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star key={`full-${index}`} size={16} fill="#ffc633" color="#ffc633" />
        ))}

        {hasHalfStar && (
          <StarHalf size={16} fill="#ffc633" color="#ffc633" />
        )}

        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star key={`empty-${index}`} size={16} color="#d1d5db" />
        ))}
      </div>

      <span className={styles.ratingText}>
        {rating}/5
        {reviewsCount ? ` (${reviewsCount})` : ""}
      </span>
    </div>
  );
}

export default StarRating;