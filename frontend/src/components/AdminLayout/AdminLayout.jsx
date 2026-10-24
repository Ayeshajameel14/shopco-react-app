import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  ShoppingBag,
  Package,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
  PanelLeftClose,
  Menu,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import styles from "./AdminLayout.module.css";

const navigation = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={styles.adminLayout}>
      {sidebarOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.brand}>
          <div className={styles.brandMark}>S</div>

          <div>
            <h2>SHOPCO</h2>
            <span>ADMIN PANEL</span>
          </div>

          <button
            type="button"
            className={styles.closeSidebar}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        <div className={styles.navLabel}>WORKSPACE</div>

        <nav className={styles.navigation}>
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `${styles.navLink} ${
                    isActive ? styles.activeLink : ""
                  }`
                }
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.adminProfile}>
            <div className={styles.avatar}>
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>

            <div className={styles.profileInfo}>
              <strong>{user?.name || "Administrator"}</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={17} />
            Back to Store
          </button>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className={styles.breadcrumb}>
            <span>ShopCo</span>
            <span className={styles.breadcrumbDivider}>/</span>
            <strong>Management</strong>
          </div>

          <div className={styles.topbarRight}>
            <span className={styles.onlineDot} />
            <span>Admin workspace</span>
          </div>
        </header>

        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;