import { X } from "lucide-react";
import QuantitySelector from "../QuantitySelector/QuantitySelector";
import styles from "./CartItem.module.css";

function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className={styles.cartItem}>
      <div className={styles.imageWrapper}>
        <img src={item.image} alt={item.name} />
      </div>

      <div className={styles.details}>
        <div className={styles.topRow}>
          <h3>{item.name}</h3>

          <button className={styles.removeButton} onClick={onRemove}>
            <X size={18} />
          </button>
        </div>

        <p className={styles.meta}>
          Size: <span>{item.size}</span>
        </p>

        <p className={styles.meta}>
          Color:{" "}
          <span
            className={styles.colorDot}
            style={{ background: item.color }}
          ></span>
        </p>

        <div className={styles.bottomRow}>
          <span className={styles.price}>
            ${(item.price * item.quantity).toFixed(2)}
          </span>

          <QuantitySelector
            quantity={item.quantity}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
          />
        </div>
      </div>
    </div>
  );
}

export default CartItem;