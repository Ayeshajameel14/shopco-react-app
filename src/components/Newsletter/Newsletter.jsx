import { useState } from "react";
import styles from "./Newsletter.module.css";

function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  return (
    <div className={styles.newsletter}>
      <div className={styles.content}>
        <h2>STAY UPTO DATE ABOUT OUR LATEST OFFERS</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Subscribe to Newsletter</button>
        </form>
      </div>
    </div>
  );
}

export default Newsletter;