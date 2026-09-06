import styles from "./BrandsBar.module.css";

const brands = ["VERSACE", "ZARA", "GUCCI", "PRADA", "Calvin Klein"];

function BrandsBar() {
  return (
    <div className={styles.brandsBar}>
      {brands.map((brand) => (
        <span key={brand} className={styles.brandName}>
          {brand}
        </span>
      ))}
    </div>
  );
}

export default BrandsBar;