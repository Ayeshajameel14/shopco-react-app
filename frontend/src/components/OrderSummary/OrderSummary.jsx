import { useState } from "react";
import { ArrowRight, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./OrderSummary.module.css";

function OrderSummary({ subtotal }) {
  const [promoCode, setPromoCode] = useState("");
  const navigate = useNavigate();

  const discount = subtotal > 0 ? subtotal * 0.2 : 0;
  const deliveryFee = subtotal > 0 ? 15 : 0;
  const total = subtotal - discount + deliveryFee;

  const handleApplyPromo = (e) => {
    e.preventDefault();

    if (!promoCode.trim()) {
      alert("Please enter a promo code.");
      return;
    }

    alert(`Promo code "${promoCode}" applied (demo only).`);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className={styles.summary}>
      <h2>Order Summary</h2>

      <div className={styles.row}>
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      <div className={styles.row}>
        <span>Discount (-20%)</span>
        <span className={styles.discountText}>
          -${discount.toFixed(2)}
        </span>
      </div>

      <div className={styles.row}>
        <span>Delivery Fee</span>
        <span>${deliveryFee.toFixed(2)}</span>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.totalRow}>
        <span>Total</span>
        <span>${total > 0 ? total.toFixed(2) : "0.00"}</span>
      </div>

      <form onSubmit={handleApplyPromo} className={styles.promoForm}>
        <div className={styles.promoInput}>
          <Tag size={18} />

          <input
            type="text"
            placeholder="Add promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.applyButton}>
          Apply
        </button>
      </form>

      <button
        type="button"
        className={styles.checkoutButton}
        onClick={handleCheckout}
      >
        Go to Checkout <ArrowRight size={18} />
      </button>
    </div>
  );
}

export default OrderSummary;
