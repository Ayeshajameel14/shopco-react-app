import { Link } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CartItem from "../../components/CartItem/CartItem";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import { useCart } from "../../context/CartContext";
import styles from "./Cart.module.css";

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className={styles.cartPage}>
        <div className={styles.container}>
          <Breadcrumb items={[{ label: "Cart" }]} />

          <div className={styles.emptyState}>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop" className={styles.shopLink}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.cartPage}>
      <div className={styles.container}>
        <Breadcrumb items={[{ label: "Cart" }]} />

        <h1>Your Cart</h1>

        <div className={styles.layout}>
          <div className={styles.itemsList}>
            {cartItems.map((item) => (
              <CartItem
                key={`${item.id}-${item.size}-${item.color}`}
                item={item}
                onIncrease={() =>
                  updateQuantity(
                    item.id,
                    item.size,
                    item.color,
                    item.quantity + 1
                  )
                }
                onDecrease={() =>
                  updateQuantity(
                    item.id,
                    item.size,
                    item.color,
                    item.quantity - 1
                  )
                }
                onRemove={() =>
                  removeFromCart(item.id, item.size, item.color)
                }
              />
            ))}
          </div>

          <OrderSummary subtotal={cartTotal} />
        </div>
      </div>
    </main>
  );
}

export default Cart;