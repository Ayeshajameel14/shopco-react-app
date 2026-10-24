import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import styles from "./Breadcrumb.module.css";

function Breadcrumb({ items }) {
  return (
    <div className={styles.breadcrumb}>
      <Link to="/">Home</Link>

      {items.map((item, index) => (
        <span key={index} className={styles.crumbItem}>
          <ChevronRight size={14} />
          {item.link ? <Link to={item.link}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </div>
  );
}

export default Breadcrumb;