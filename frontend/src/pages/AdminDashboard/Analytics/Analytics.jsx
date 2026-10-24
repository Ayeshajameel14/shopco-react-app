import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import styles from "./Analytics.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const categoryColors = [
  "#16a34a",
  "#86efac",
  "#bbf7d0",
  "#dcfce7",
  "#15803d",
];

function formatPKR(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}`;
}

function Analytics() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();

  const [chartType, setChartType] = useState("revenue");
  const [analytics, setAnalytics] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    if (!token) return;

    setFetching(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/orders/admin/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load analytics."
        );
      }

      setAnalytics(data);
    } catch (err) {
      setError(err.message || "Unable to load analytics.");
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (loading) return;

    if (!token) {
      navigate("/login");
      return;
    }

    loadAnalytics();
  }, [token, loading, navigate, loadAnalytics]);

  if (loading || fetching) {
    return (
      <main className={styles.page}>
        <p>Loading real store analytics...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              STORE PERFORMANCE
            </span>
            <h1>Analytics Overview</h1>
          </div>

          <button
            type="button"
            onClick={loadAnalytics}
            className={styles.headerBadge}
          >
            <RefreshCw size={17} />
            Retry
          </button>
        </header>

        <p role="alert">{error}</p>
      </main>
    );
  }

  const summary = analytics?.summary || {};
  const revenueData = analytics?.revenueByMonth || [];
  const orderStatuses = (analytics?.orderStatuses || []).filter(
    (item) => item.count > 0
  );
  const bestSellingProducts =
    analytics?.bestSellingProducts || [];

  const totalRevenue = Number(summary.revenue || 0);
  const totalOrders = Number(summary.totalOrders || 0);
  const totalDelivered = Number(summary.deliveredOrders || 0);
  const totalPending = Number(summary.pendingOrders || 0);
  const totalCancelled = Number(summary.cancelledOrders || 0);

  const chartTotal =
    chartType === "revenue"
      ? revenueData.reduce(
          (total, item) => total + Number(item.revenue || 0),
          0
        )
      : revenueData.reduce(
          (total, item) => total + Number(item.orders || 0),
          0
        );

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>
            STORE PERFORMANCE
          </span>
          <h1>Analytics Overview</h1>
          <p>
            Real order and sales statistics from your store.
          </p>
        </div>

        <button
          type="button"
          className={styles.headerBadge}
          onClick={loadAnalytics}
          disabled={fetching}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statTop}>
            <span>Delivered Revenue</span>
            <div className={styles.statIcon}>
              <DollarSign size={20} />
            </div>
          </div>
          <h2>{formatPKR(totalRevenue)}</h2>
          <p className={styles.statNote}>
            Revenue from delivered orders
          </p>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statTop}>
            <span>Total Orders</span>
            <div className={styles.statIcon}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <h2>{totalOrders.toLocaleString()}</h2>
          <p className={styles.statNote}>
            All order statuses
          </p>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statTop}>
            <span>Delivered Orders</span>
            <div className={styles.statIcon}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h2>{totalDelivered.toLocaleString()}</h2>
          <p className={styles.statNote}>
            Successfully delivered
          </p>
        </article>
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Revenue Overview</h2>
              <p>Monthly orders and delivered revenue</p>
            </div>

            <div className={styles.chartToggle}>
              <button
                type="button"
                className={
                  chartType === "revenue"
                    ? styles.activeToggle
                    : ""
                }
                onClick={() => setChartType("revenue")}
              >
                Revenue
              </button>

              <button
                type="button"
                className={
                  chartType === "orders"
                    ? styles.activeToggle
                    : ""
                }
                onClick={() => setChartType("orders")}
              >
                Orders
              </button>
            </div>
          </div>

          <div className={styles.chartSummary}>
            <h3>
              {chartType === "revenue"
                ? formatPKR(chartTotal)
                : chartTotal.toLocaleString()}
            </h3>
            <span>Last 6 months</span>
          </div>

          <div className={styles.barChart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{
                  top: 10,
                  right: 8,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#edf0f5"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#8994a5",
                    fontSize: 12,
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={chartType === "revenue" ? 65 : 45}
                  tick={{
                    fill: "#8994a5",
                    fontSize: 11,
                  }}
                  tickFormatter={(value) =>
                    chartType === "revenue"
                      ? `${Math.round(value / 1000)}k`
                      : value
                  }
                />
                <Tooltip
                  formatter={(value) =>
                    chartType === "revenue"
                      ? [formatPKR(value), "Revenue"]
                      : [value, "Orders"]
                  }
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #e8edf4",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey={chartType}
                  fill="#16a34a"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Order Status</h2>
              <p>Distribution of your real orders</p>
            </div>
          </div>

          {orderStatuses.length === 0 ? (
            <p>No orders available yet.</p>
          ) : (
            <div className={styles.donutArea}>
              <div className={styles.donutChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatuses}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {orderStatuses.map((entry, index) => (
                        <Cell
                          key={entry.status}
                          fill={
                            categoryColors[
                              index % categoryColors.length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className={styles.donutCenter}>
                  <strong>{totalOrders}</strong>
                  <span>Total orders</span>
                </div>
              </div>

              <div className={styles.legend}>
                {orderStatuses.map((item, index) => (
                  <div
                    className={styles.legendItem}
                    key={item.status}
                  >
                    <span
                      className={styles.legendDot}
                      style={{
                        backgroundColor:
                          categoryColors[
                            index % categoryColors.length
                          ],
                      }}
                    />
                    <span className={styles.legendName}>
                      {item.status}
                    </span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Best-Selling Products</h2>
            <p>Top products in delivered orders</p>
          </div>
        </div>

        {bestSellingProducts.length === 0 ? (
          <p>No delivered product sales available yet.</p>
        ) : (
          <div className={styles.trafficList}>
            {bestSellingProducts.map((product) => (
              <div
                className={styles.trafficItem}
                key={product.name}
              >
                <div className={styles.trafficInfo}>
                  <span>{product.name}</span>
                  <strong>
                    {product.quantitySold} sold ·{" "}
                    {formatPKR(product.sales)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Order Summary</h2>
            <p>Current order status totals</p>
          </div>
        </div>

        <div className={styles.trafficList}>
          <div className={styles.trafficItem}>
            <div className={styles.trafficInfo}>
              <span>Pending orders</span>
              <strong>{totalPending}</strong>
            </div>
          </div>

          <div className={styles.trafficItem}>
            <div className={styles.trafficInfo}>
              <span>Cancelled orders</span>
              <strong>{totalCancelled}</strong>
            </div>
          </div>
        </div>
      </section>

      <p className={styles.demoNote}>
        Figures are loaded from your store's order database.
        Revenue counts delivered orders only. Category sales and
        visitor traffic require additional tracking data.
      </p>
    </div>
  );
}

export default Analytics;