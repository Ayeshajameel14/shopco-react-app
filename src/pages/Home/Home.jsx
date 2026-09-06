import Hero from "../../components/Hero/Hero";
import BrandsBar from "../../components/BrandsBar/BrandsBar";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import DressStyle from "../../components/DressStyle/DressStyle";
import Testimonials from "../../components/Testimonials/Testimonials";
import { products } from "../../data/products";
import styles from "./Home.module.css";

function Home() {
  const newArrivals = products.slice(0, 4);
  const topSelling = products.slice(4, 8);

  return (
    <main>
      <Hero />
      <BrandsBar />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>NEW ARRIVALS</h2>
        <ProductGrid products={newArrivals} />
      </section>

      <div className={styles.divider}></div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>TOP SELLING</h2>
        <ProductGrid products={topSelling} />
      </section>

      <DressStyle />
      <Testimonials />
    </main>
  );
}

export default Home;