
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  RefreshCw,
  Mail,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import styles from "./Customers.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Customers() {
  const { token, loading: authLoading } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(async () => {
    if (authLoading) return;

    if (!token) {
      setError("Please log in with an administrator account.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/users/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load customers.");
      }

      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message || "Something went wrong while loading customers.");
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>CUSTOMER MANAGEMENT</p>
          <h1>Customers</h1>
          <p className={styles.subtitle}>
            View and manage your registered customers.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={fetchCustomers}
          disabled={loading || authLoading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={21} />
          </div>
          <div>
            <p>Total Customers</p>
            <h2>{customers.length}</h2>
            <span>Registered customer accounts</span>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <UserRound size={21} />
          </div>
          <div>
            <p>Search Results</p>
            <h2>{filteredCustomers.length}</h2>
            <span>Customers matching your search</span>
          </div>
        </article>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h2>All Customers</h2>
            <p>Customer information from your database</p>
          </div>

          <label className={styles.searchBox}>
            <Search size={18} />
            <input
              type="search"
              placeholder="Search name or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <button type="button" onClick={fetchCustomers}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.messageState}>Loading customers...</div>
        ) : !error && filteredCustomers.length === 0 ? (
          <div className={styles.messageState}>
            <Users size={30} />
            <h3>{search ? "No customers found" : "No customers yet"}</h3>
            <p>
              {search
                ? "Try another name or email address."
                : "Registered customer accounts will appear here."}
            </p>
          </div>
        ) : !error ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.avatar}>
                          {(customer.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{customer.name || "Unnamed customer"}</strong>
                          <span>Customer account</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={styles.emailCell}>
                        <Mail size={15} />
                        {customer.email}
                      </span>
                    </td>

                    <td>
                      <span className={styles.roleBadge}>
                        {customer.role}
                      </span>
                    </td>

                    <td>
                      <span className={styles.dateCell}>
                        <CalendarDays size={15} />
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!loading && !error && filteredCustomers.length > 0 && (
          <div className={styles.tableFooter}>
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        )}
      </section>
    </main>
  );
}

export default Customers;
