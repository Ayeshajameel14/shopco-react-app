import { Link } from "react-router-dom";
import { FaTwitter, FaFacebookF, FaInstagram, FaGithub } from "react-icons/fa";
import Newsletter from "../Newsletter/Newsletter";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <Newsletter />

      <div className={styles.footerContent}>
        <div className={styles.brandCol}>
          <Link to="/" className={styles.logo}>
            SHOP.CO
          </Link>
          <p>
            We have clothes that suits your style and which you're proud to
            wear. From women to men.
          </p>
          <div className={styles.socialIcons}>
            <FaTwitter size={16} />
            <FaFacebookF size={16} />
            <FaInstagram size={16} />
            <FaGithub size={16} />
          </div>
        </div>

        <div className={styles.linkCol}>
          <h4>Company</h4>
          <ul>
            <li>About</li>
            <li>Features</li>
            <li>Works</li>
            <li>Career</li>
          </ul>
        </div>

        <div className={styles.linkCol}>
          <h4>Help</h4>
          <ul>
            <li>Customer Support</li>
            <li>Delivery Details</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className={styles.linkCol}>
          <h4>FAQ</h4>
          <ul>
            <li>Account</li>
            <li>Manage Deliveries</li>
            <li>Orders</li>
            <li>Payments</li>
          </ul>
        </div>

        <div className={styles.linkCol}>
          <h4>Resources</h4>
          <ul>
            <li>Free eBooks</li>
            <li>Development Tutorial</li>
            <li>How to - Blog</li>
            <li>Youtube Playlist</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>Shop.co © 2026, All Rights Reserved</p>
      </div>
    </footer>
  );
}

export default Footer;