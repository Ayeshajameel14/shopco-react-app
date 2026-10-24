
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./MyOrders.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function MyOrders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      if (!token) {
        setError("Please log in to view your orders.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load your orders.");
        }

        if (isMounted) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [token]);

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatPrice(price) {
    return `$${Number(price || 0).toFixed(2)}`;
  }

  function getStatusClass(status) {
    const value = (status || "Pending").toLowerCase();

    if (value === "confirmed") return styles.confirmed;
    if (value === "shipped") return styles.shipped;
    if (value === "delivered") return styles.delivered;
    if (value === "cancelled") return styles.cancelled;

    return styles.pending;
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.message}>Loading your orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <section className={styles.emptyState}>
          <h1>My Orders</h1>
          <p>{error}</p>
          <Link to="/login" className={styles.primaryButton}>
            Log In
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>SHOPCO / ACCOUNT</p>
          <h1>My Orders</h1>
          <p className={styles.subtitle}>
            Track your purchases and check your order status.
          </p>
        </div>

        <Link to="/shop" className={styles.continueButton}>
          Continue Shopping
        </Link>
      </header>

      <div className={styles.orderCount}>
        <span>Order History</span>
        <strong>
          {orders.length} {orders.length === 1 ? "Order" : "Orders"}
        </strong>
      </div>

      {orders.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h2>No orders yet</h2>
          <p>
            Your orders will appear here after you complete a purchase.
          </p>
          <Link to="/shop" className={styles.primaryButton}>
            Explore Products
          </Link>
        </section>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <article className={styles.orderCard} key={order._id}>
              <div className={styles.orderHeader}>
                <div className={styles.orderMeta}>
                  <span>ORDER NUMBER</span>
                  <strong>#{order._id}</strong>
                </div>

                <div className={styles.orderMeta}>
                  <span>ORDER DATE</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>

                <div className={styles.orderMeta}>
                  <span>PAYMENT</span>
                  <strong>
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentMethod}
                  </strong>
                </div>

                <span
                  className={`${styles.status} ${getStatusClass(order.status)}`}
                >
                  {order.status || "Pending"}
                </span>
              </div>

              <div className={styles.products}>
                {(order.items || []).map((item, index) => (
                  <div
                    className={styles.product}
                    key={`${item.productId}-${index}`}
                  >
                    <div className={styles.productImage}>
                      <img
                        src={item.image || "/images/placeholder.png"}
                        alt={item.name || "Product"}
                      />
                    </div>

                    <div className={styles.productInfo}>
                      <h3>{item.name || "Product"}</h3>
                      <p>Quantity: {item.quantity || 1}</p>
                      <p>Size: {item.size || "Standard"}</p>
                      {item.color && <p>Color: {item.color}</p>}
                    </div>

                    <strong className={styles.itemPrice}>
                      {formatPrice(
                        Number(item.price || 0) * Number(item.quantity || 1)
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.deliveryInfo}>
                  <span>Delivery address</span>
                  <p>
                    {order.shippingAddress?.address || "Address unavailable"}
                    {order.shippingAddress?.city
                      ? `, ${order.shippingAddress.city}`
                      : ""}
                  </p>
                </div>

                <div className={styles.totalInfo}>
                  <span>Order Total</span>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyOrders;
