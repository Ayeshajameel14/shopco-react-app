import { Link } from "react-router-dom";
import styles from "./DressStyle.module.css";

const styleCards = [
  {
    name: "Casual",
    image: "/images/styles/Casual.jfif",
    size: "small",
  },
  {
    name: "Formal",
    image: "/images/styles/Formal.jfif",
    size: "small",
  },
  {
    name: "Party",
    image: "/images/styles/Party.png",
    size: "large",
  },
  {
    name: "Gym",
    image: "/images/styles/Gym.png",
    size: "large",
  },
];

function DressStyle() {
  return (
    <section className={styles.dressStyle}>
      <div className={styles.wrapper}>
        <h2>BROWSE BY DRESS STYLE</h2>

        <div className={styles.grid}>
          {styleCards.map((card) => (
            <Link
              key={card.name}
              to="/shop"
              className={`${styles.card} ${
                card.size === "large" ? styles.large : styles.small
              }`}
            >
              <img src={card.image} alt={card.name} />
              <span className={styles.cardLabel}>{card.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DressStyle;