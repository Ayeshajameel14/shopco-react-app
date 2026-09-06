import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import styles from "./Navbar.module.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <header className={styles.navbar}>
      <div className={styles.topBar}>
        <p>
          Sign up and get 20% off to your first order.{" "}
          <Link to="/shop" className={styles.signUpLink}>
            Sign Up Now
          </Link>
        </p>
      </div>

      <div className={styles.mainNav}>
        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={26} />
        </button>

        <Link to="/" className={styles.logo}>
          SHOP.CO
        </Link>

        <nav className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
          <Link to="/shop">Shop</Link>
          <Link to="/shop">On Sale</Link>
          <Link to="/shop">New Arrivals</Link>
          <Link to="/shop">Brands</Link>
        </nav>

        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search for products..." />
        </div>

        <div className={styles.navIcons}>
          <Link to="/cart" className={styles.cartIcon}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>
          <User size={24} />
        </div>
      </div>
    </header>
  );
}

export default Navbar;