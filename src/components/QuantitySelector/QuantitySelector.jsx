import { Minus, Plus } from "lucide-react";
import styles from "./QuantitySelector.module.css";

function QuantitySelector({ quantity, onIncrease, onDecrease }) {
  return (
    <div className={styles.quantitySelector}>
      <button onClick={onDecrease} disabled={quantity <= 1}>
        <Minus size={16} />
      </button>

      <span>{quantity}</span>

      <button onClick={onIncrease}>
        <Plus size={16} />
      </button>
    </div>
  );
}

export default QuantitySelector;