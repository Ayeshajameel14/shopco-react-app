import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Testimonials.module.css";

const reviews = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    text: "I'm blown away by the quality and style of the clothes I received. From casual wear to elegant dresses, every piece exceeds my expectations.",
  },
  {
    id: 2,
    name: "Alex K.",
    rating: 5,
    text: "Finding clothes that align with my personal style used to be a challenge until I discovered this site. The range of options is truly impressive.",
  },
  {
    id: 3,
    name: "James L.",
    rating: 4.5,
    text: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon this store. Amazing collection!",
  },
];

function Testimonials() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;

  const showPrev = () => {
    setStartIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const showNext = () => {
    setStartIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const visibleReviews = Array.from({ length: visibleCount }).map(
    (_, index) => reviews[(startIndex + index) % reviews.length]
  );

  return (
    <section className={styles.testimonials}>
      <div className={styles.header}>
        <h2>OUR HAPPY CUSTOMERS</h2>

        <div className={styles.navButtons}>
          <button onClick={showPrev}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={showNext}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {visibleReviews.map((review) => (
          <div key={review.id} className={styles.card}>
            <div className={styles.stars}>
              {Array.from({ length: Math.floor(review.rating) }).map(
                (_, index) => (
                  <Star
                    key={index}
                    size={16}
                    fill="#ffc633"
                    color="#ffc633"
                  />
                )
              )}
            </div>

            <h4>{review.name}</h4>
            <p>"{review.text}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;