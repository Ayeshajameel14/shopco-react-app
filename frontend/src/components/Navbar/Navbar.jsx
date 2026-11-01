
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { cartCount } = useCart();
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/");
  }

  function handleSearch(event) {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      navigate("/shop");
    } else {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
    }

    closeMenu();
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.topBar}>
        <p>
          Sign up and get 20% off on your first order.{" "}
          {!token && (
            <Link
              to="/signup"
              className={styles.signUpLink}
              onClick={closeMenu}
            >
              Sign Up Now
            </Link>
          )}
        </p>
      </div>

      <div className={styles.mainNav}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          <Menu size={26} />
        </button>

        <Link to="/" className={styles.logo} onClick={closeMenu}>
          SHOP.CO
        </Link>

        <nav
          className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""
            }`}
        >
          <Link to="/shop" onClick={closeMenu}>Shop</Link>
          <Link to="/shop?filter=sale" onClick={closeMenu}>On Sale</Link>
          <Link to="/shop?filter=new" onClick={closeMenu}>New Arrivals</Link>
          <Link to="/shop?filter=brands" onClick={closeMenu}>Brands</Link>

          {token ? (
            <>
              <Link to="/my-orders" onClick={closeMenu}>
                My Orders
              </Link>

              {isAdmin && (
                <Link to="/admin" onClick={closeMenu}>
                  Admin Dashboard
                </Link>
              )}

              {/* <button
                type="button"
                onClick={handleLogout}
                className={`${styles.logoutButton} ${styles.mobileOnly}`}
              >
                <LogOut size={18} />
                Logout
              </button> */}
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className={styles.mobileOnly}
            >
              Login
            </Link>
          )}
        </nav>

        <form className={styles.searchBar} onSubmit={handleSearch}>
          <button
            type="submit"
            aria-label="Search products"
            title="Search products"
            style={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <Search size={18} className={styles.searchIcon} />
          </button>

          <input
            type="search"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search for products"
          />
        </form>

        <div className={styles.navIcons}>
          <Link
            to="/cart"
            className={styles.cartIcon}
            aria-label="Shopping cart"
            title="Shopping Cart"
            onClick={closeMenu}
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>

          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              className={styles.logoutIconButton}
            >
              <LogOut size={23} />
            </button>
          ) : (
            <Link
              to="/login"
              aria-label="Log in"
              title="Log in"
              onClick={closeMenu}
            >
              <User size={24} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
