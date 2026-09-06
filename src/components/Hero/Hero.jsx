import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import styles from "./Hero.module.css";

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.textContent}>
        <h1>FIND CLOTHES THAT MATCHES YOUR STYLE</h1>

        <p>
          Browse through our diverse range of meticulously crafted garments,
          designed to bring out your individuality and cater to your sense of
          style.
        </p>

        <Link to="/shop" className={styles.shopButton}>
          Shop Now
        </Link>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <h3>200+</h3>
            <p>International Brands</p>
          </div>

          <div className={styles.statDivider}></div>

          <div className={styles.statItem}>
            <h3>2,000+</h3>
            <p>High-Quality Products</p>
          </div>

          <div className={styles.statDivider}></div>

          <div className={styles.statItem}>
            <h3>30,000+</h3>
            <p>Happy Customers</p>
          </div>
        </div>
      </div>

      <div className={styles.imageWrapper}>
        <img src="Hero.jpg" alt="Fashion models" />

        <Sparkles className={styles.starTop} size={40} />
        <Sparkles className={styles.starBottom} size={28} />
      </div>
    </section>
  );
}

export default Hero;