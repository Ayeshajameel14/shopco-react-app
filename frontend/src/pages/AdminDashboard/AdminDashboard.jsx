
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Clock3,
  Truck,
  CheckCircle2,
  Banknote,
  Package,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import styles from "./AdminDashboard.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function AdminDashboard() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (loading) return;

    if (!token) {
      navigate("/login");
      return;
    }

    loadOrders();
  }, [token, loading]);

  async function loadOrders() {
    setFetching(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setFetching(false);
    }
  }

  async function updateStatus(orderId, status) {
    setUpdatingId(orderId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/orders/admin/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? data.order : order
        )
      );
    } catch (err) {
      setError(err.message || "Unable to update status.");
    } finally {
      setUpdatingId("");
    }
  }

  const stats = useMemo(() => {
    const countByStatus = (status) =>
      orders.filter((order) => order.status === status).length;

    // Revenue is calculated from orders actually marked Delivered.
    const deliveredRevenue = orders
      .filter((order) => order.status === "Delivered")
      .reduce((total, order) => total + (Number(order.total) || 0), 0);

    const nonCancelledValue = orders
      .filter((order) => order.status !== "Cancelled")
      .reduce((total, order) => total + (Number(order.total) || 0), 0);

    return {
      total: orders.length,
      pending: countByStatus("Pending"),
      confirmed: countByStatus("Confirmed"),
      shipped: countByStatus("Shipped"),
      delivered: countByStatus("Delivered"),
      cancelled: countByStatus("Cancelled"),
      deliveredRevenue,
      nonCancelledValue,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
      .filter((order) => {
        const customerName =
          order.user?.name ||
          order.shippingAddress?.fullName ||
          "Customer";

        const customerEmail =
          order.user?.email ||
          order.shippingAddress?.email ||
          "";

        const orderNumber = order._id || "";

        const matchesSearch =
          !query ||
          customerName.toLowerCase().includes(query) ||
          customerEmail.toLowerCase().includes(query) ||
          orderNumber.toLowerCase().includes(query) ||
          orderNumber.slice(-6).toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" || order.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
  }, [orders, searchTerm, statusFilter]);

  if (loading || fetching) {
    return (
      <main className={styles.page}>
        <div className={styles.message}>Loading your dashboard...</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.dashboardContainer}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>SHOPCO MANAGEMENT</p>
            <h1>Admin Dashboard</h1>
            <p className={styles.subtitle}>
              Monitor orders, track deliveries and review sales.
            </p>
          </div>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={loadOrders}
            disabled={fetching}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <section className={styles.summary}>
          <article className={styles.summaryCard}>
            <div className={styles.statIcon}>
              <ShoppingBag size={21} />
            </div>
            <span>Total Orders</span>
            <strong>{stats.total}</strong>
            <small>All customer orders</small>
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.statIcon}>
              <Clock3 size={21} />
            </div>
            <span>Pending Orders</span>
            <strong>{stats.pending}</strong>
            <small>Awaiting processing</small>
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.statIcon}>
              <Truck size={21} />
            </div>
            <span>Shipped Orders</span>
            <strong>{stats.shipped}</strong>
            <small>In delivery</small>
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.statIcon}>
              <CheckCircle2 size={21} />
            </div>
            <span>Delivered Orders</span>
            <strong>{stats.delivered}</strong>
            <small>Successfully delivered</small>
          </article>
        </section>

        <section className={styles.revenueSection}>
          <div className={styles.revenueIcon}>
            <Banknote size={25} />
          </div>

          <div>
            <p className={styles.revenueLabel}>Delivered Revenue</p>
            <h2>${stats.deliveredRevenue.toFixed(2)}</h2>
            <p className={styles.revenueNote}>
              Total value of orders marked as delivered
            </p>
          </div>

          <div className={styles.revenueDivider} />

          <div>
            <p className={styles.revenueLabel}>Non-cancelled Order Value</p>
            <h2>${stats.nonCancelledValue.toFixed(2)}</h2>
            <p className={styles.revenueNote}>
              Value of orders excluding cancelled orders
            </p>
          </div>
        </section>

        <section className={styles.ordersSection}>
          <div className={styles.ordersHeading}>
            <div>
              <h2>Customer Orders</h2>
              <p>Search orders and manage delivery status.</p>
            </div>

            <span className={styles.orderCount}>
              {filteredOrders.length} orders
            </span>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={19} />
              <input
                type="search"
                placeholder="Search order ID, customer or email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <select
              className={styles.statusFilter}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter orders by status"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={36} />
              <h3>No orders yet</h3>
              <p>Customer orders will appear here after checkout.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <Search size={36} />
              <h3>No matching orders</h3>
              <p>Try a different search term or order status.</p>
              <button
                type="button"
                className={styles.refreshButton}
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className={styles.orderList}>
              {filteredOrders.map((order) => {
                const customerName =
                  order.user?.name ||
                  order.shippingAddress?.fullName ||
                  "Customer";

                const customerEmail =
                  order.user?.email ||
                  order.shippingAddress?.email ||
                  "";

                return (
                  <article
                    className={styles.orderCard}
                    key={order._id}
                  >
                    <div className={styles.orderHeader}>
                      <div>
                        <h3>
                          Order #{order._id.slice(-6).toUpperCase()}
                        </h3>
                        <p>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString()
                            : "Date unavailable"}
                        </p>
                      </div>

                      <strong className={styles.orderTotal}>
                        ${Number(order.total || 0).toFixed(2)}
                      </strong>
                    </div>

                    <div className={styles.customer}>
                      <strong>{customerName}</strong>
                      {customerEmail && <span>{customerEmail}</span>}
                    </div>

                    <div className={styles.items}>
                      <strong>Items</strong>
                      {order.items?.map((item, index) => (
                        <p key={`${order._id}-${index}`}>
                          {item.name || item.product?.name || "Product"}{" "}
                          × {item.quantity}
                        </p>
                      ))}
                    </div>

                    <div className={styles.statusRow}>
                      <div>
                        <span className={styles.statusLabel}>
                          Current status
                        </span>
                        <strong
                          className={`${styles.statusBadge} ${
                            styles[`status${order.status}`] || ""
                          }`}
                        >
                          {order.status}
                        </strong>
                      </div>

                      <label className={styles.statusControl}>
                        <span>Update status</span>
                        <select
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(event) =>
                            updateStatus(order._id, event.target.value)
                          }
                          aria-label={`Update status for order ${order._id}`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {updatingId === order._id && (
                      <p className={styles.note}>Updating status...</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
