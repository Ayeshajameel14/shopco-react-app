import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import styles from "./Checkout.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const paymentMethods = [
  { value: "COD", label: "Cash on Delivery", icon: "💵" },
  { value: "Card", label: "Credit / Debit Card", icon: "💳" },
  { value: "Easypaisa", label: "Easypaisa", icon: "📱" },
  { value: "JazzCash", label: "JazzCash", icon: "📲" },
];

function Checkout() {
  const { cartItems, cartTotal, cartLoading, clearCart } = useCart();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [selectedPayment, setSelectedPayment] = useState("COD");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Please log in before placing your order.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (selectedPayment !== "COD") {
      setError(
        "This payment method is not available yet. Please select Cash on Delivery."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          paymentMethod: "COD",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to place your order.");
      }

      setPlacedOrder(data.order);
      setMessage("Your order has been placed successfully!");

      if (typeof clearCart === "function") {
        await clearCart();
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (cartLoading) {
    return <main className={styles.status}>Loading your cart...</main>;
  }

  if (placedOrder) {
    return (
      <main className={styles.empty}>
        <h1>Thank you for your order!</h1>
        <p>{message}</p>
        <p>
          Order number: <strong>{placedOrder._id}</strong>
        </p>
        <p>
          Total to pay on delivery: $
          {Number(placedOrder.total).toFixed(2)}
        </p>
        <Link to="/shop" className={styles.shopButton}>
          Continue Shopping
        </Link>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className={styles.empty}>
        <h1>Your cart is empty</h1>
        <p>Add some products before proceeding to checkout.</p>
        <Link to="/shop" className={styles.shopButton}>
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.checkoutPage}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>SHOPCO / CHECKOUT</p>
        <h1>Complete Your Order</h1>
        <p>Enter your delivery details and review your order.</p>
      </div>

      <div className={styles.checkoutLayout}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2>Delivery Information</h2>
          <p className={styles.sectionDescription}>
            Where should we deliver your order?
          </p>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="03XXXXXXXXX"
                autoComplete="tel"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                autoComplete="address-level2"
                required
              />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="address">Complete Delivery Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House number, street, area..."
                rows={3}
                autoComplete="street-address"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="postalCode">Postal Code</label>
              <input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal code"
                autoComplete="postal-code"
              />
            </div>
          </div>

          <div className={styles.paymentBox}>
            <h3>Payment Method</h3>

            <label className={styles.paymentSelectLabel} htmlFor="paymentMethod">
              Select your preferred payment method
            </label>

            <div className={styles.paymentDropdown}>
              <span className={styles.paymentDropdownIcon}>
                {paymentMethods.find(
                  (method) => method.value === selectedPayment
                )?.icon}
              </span>

              <select
                id="paymentMethod"
                name="paymentMethod"
                value={selectedPayment}
                onChange={(event) => {
                  setSelectedPayment(event.target.value);
                  setError("");
                }}
                className={styles.paymentSelect}
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <p className={styles.paymentNotice}>
              {selectedPayment === "COD"
                ? "Pay when your order arrives at your doorstep."
                : `${paymentMethods.find((method) => method.value === selectedPayment)?.label} is for demonstration only. Currently, Cash on Delivery is the only available payment method.`}
            </p>
          </div>

          {error && (
            <p className={styles.infoMessage} role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className={styles.infoMessage} role="status">
              {message}
            </p>
          )}

          <button
            type="submit"
            className={styles.placeOrderButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>

          <Link to="/cart" className={styles.backLink}>
            ← Return to Cart
          </Link>
        </form>

        <aside className={styles.summaryCard}>
          <h2>Order Summary</h2>

          <div className={styles.productList}>
            {cartItems.map((item, index) => (
              <div
                className={styles.product}
                key={`${item.productId ?? item.id}-${item.size}-${item.color}-${index}`}
              >
                <div className={styles.productImage}>
                  <img
                    src={item.image || "/images/placeholder.png"}
                    alt={item.name}
                  />
                  <span className={styles.quantityBadge}>
                    {item.quantity}
                  </span>
                </div>

                <div className={styles.productInfo}>
                  <h3>{item.name}</h3>
                  <p>Size: {item.size || "Standard"}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>

                <strong className={styles.productPrice}>
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          <div className={styles.summaryLine}>
            <span>Subtotal</span>
            <span>${Number(cartTotal).toFixed(2)}</span>
          </div>

          <div className={styles.summaryLine}>
            <span>Discount (20%)</span>
            <span>-${(Number(cartTotal) * 0.2).toFixed(2)}</span>
          </div>

          <div className={styles.summaryLine}>
            <span>Delivery</span>
            <span>${cartTotal > 0 ? "15.00" : "0.00"}</span>
          </div>

          <div className={`${styles.summaryLine} ${styles.totalLine}`}>
            <strong>Total</strong>
            <strong>
              $
              {(
                Number(cartTotal) -
                Number(cartTotal) * 0.2 +
                (cartTotal > 0 ? 15 : 0)
              ).toFixed(2)}
            </strong>
          </div>

          <p className={styles.secureNote}>
            Selected payment:{" "}
            {
              paymentMethods.find(
                (method) => method.value === selectedPayment
              )?.label
            }
          </p>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
