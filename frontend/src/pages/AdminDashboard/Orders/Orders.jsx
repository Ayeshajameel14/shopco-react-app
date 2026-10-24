import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import styles from "./Orders.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function Orders() {
  const { token, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fetching, setFetching] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  // Load all orders from the backend
  const loadOrders = useCallback(async () => {
    if (!token) return;

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
        throw new Error(data.message || "Could not load orders.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Could not load orders.");
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setFetching(false);
      setError("Please log in to view orders.");
      return;
    }

    loadOrders();
  }, [authLoading, token, loadOrders]);

  // Update order status
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
        throw new Error(data.message || "Could not update order status.");
      }

      setOrders((current) =>
        current.map((order) =>
          order._id === orderId ? data.order : order
        )
      );
    } catch (err) {
      setError(err.message || "Could not update order status.");
    } finally {
      setUpdatingId("");
    }
  }

  // Permanently delete one selected order
  async function deleteOrder(orderId) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this order? This action cannot be undone."
    );

    if (!confirmed) return;

    setUpdatingId(orderId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/orders/admin/${orderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete order.");
      }

      setOrders((current) =>
        current.filter((order) => order._id !== orderId)
      );
    } catch (err) {
      setError(err.message || "Could not delete order.");
    } finally {
      setUpdatingId("");
    }
  }

  // Search and filter orders
  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .filter((order) => {
        const name =
          order.user?.name ||
          order.shippingAddress?.fullName ||
          "Customer";

        const email =
          order.user?.email ||
          order.shippingAddress?.email ||
          "";

        const id = order._id || "";

        const matchesSearch =
          !query ||
          name.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          id.toLowerCase().includes(query) ||
          id.slice(-6).toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          order.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
  }, [orders, searchTerm, statusFilter]);

  if (authLoading || fetching) {
    return (
      <section className={styles.page}>
        <div className={styles.stateMessage}>
          <RefreshCw size={20} className={styles.spin} />
          Loading orders...
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      {/* Page header */}
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>STORE MANAGEMENT</p>
          <h1>Orders</h1>
          <p className={styles.subtitle}>
            Review customer purchases and manage order progress.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={loadOrders}
          disabled={fetching}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {/* Error message */}
      {error && (
        <div className={styles.error} role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Order summary */}
      <div className={styles.summary}>
        <div className={styles.summaryIcon}>
          <ShoppingBag size={23} />
        </div>

        <div>
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div className={styles.summaryDivider} />

        <div>
          <span>Pending</span>
          <strong>
            {
              orders.filter(
                (order) => order.status === "Pending"
              ).length
            }
          </strong>
        </div>

        <div className={styles.summaryDivider} />

        <div>
          <span>Delivered</span>
          <strong>
            {
              orders.filter(
                (order) => order.status === "Delivered"
              ).length
            }
          </strong>
        </div>
      </div>

      {/* Orders panel */}
      <div className={styles.ordersPanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>All orders</h2>
            <p>Search by order ID, customer name or email.</p>
          </div>

          <span className={styles.resultCount}>
            {filteredOrders.length} results
          </span>
        </div>

        {/* Search and status filter */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={18} />

            <input
              type="search"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <select
            className={styles.statusFilter}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter by order status"
          >
            <option value="All">All statuses</option>

            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Empty states and orders table */}
        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={35} />
            <h3>No orders yet</h3>
            <p>
              Customer orders will appear here after checkout.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={32} />
            <h3>No matching orders</h3>
            <p>Try another search term or status filter.</p>

            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
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
                    <tr key={order._id}>
                      {/* Order ID */}
                      <td>
                        <strong className={styles.orderId}>
                          #
                          {(order._id || "")
                            .slice(-6)
                            .toUpperCase()}
                        </strong>
                      </td>

                      {/* Customer details */}
                      <td>
                        <div className={styles.customer}>
                          <strong>{customerName}</strong>
                          <span>
                            {customerEmail || "No email available"}
                          </span>
                        </div>
                      </td>

                      {/* Order date */}
                      <td className={styles.dateCell}>
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* Total items */}
                      <td>
                        {order.items?.reduce(
                          (sum, item) =>
                            sum +
                            (Number(item.quantity) || 0),
                          0
                        ) || 0}
                      </td>

                      {/* Order total */}
                      <td className={styles.totalCell}>
                        ${Number(order.total || 0).toFixed(2)}
                      </td>

                      {/* Current status */}
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[`status${order.status}`] || ""
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>

                      {/* Update status */}
                      <td>
                        <select
                          className={styles.rowStatusSelect}
                          value={order.status || "Pending"}
                          disabled={updatingId === order._id}
                          onChange={(event) =>
                            updateStatus(
                              order._id,
                              event.target.value
                            )
                          }
                          aria-label={`Update order ${order._id} status`}
                        >
                          {STATUSES.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>

                        {updatingId === order._id && (
                          <span className={styles.updatingText}>
                            Processing...
                          </span>
                        )}
                      </td>

                      {/* Delete order button */}
                      <td>
                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => deleteOrder(order._id)}
                          disabled={updatingId === order._id}
                          aria-label={`Delete order ${order._id}`}
                          title="Permanently delete order"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;