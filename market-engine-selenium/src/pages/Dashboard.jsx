import { useEffect, useState, useRef } from "react";
import { getCurrentUser, getOrders, setCurrentUser } from "../services/storage";
import OrderForm from "../components/OrderForm";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

// ── Mock stock database ─────────────────────────────────────────
const BASE_STOCKS = [
  { sym: "AAPL", name: "Apple Inc.", basePrice: 214.32, change: +1.84 },
  { sym: "TSLA", name: "Tesla Inc.", basePrice: 172.56, change: -0.62 },
  { sym: "MSFT", name: "Microsoft Corp.", basePrice: 418.9, change: +0.97 },
  { sym: "GOOGL", name: "Alphabet Inc.", basePrice: 172.14, change: +1.23 },
  { sym: "NIFTY", name: "Nifty 50 Index", basePrice: 22513, change: +0.43 },
  { sym: "AMZN", name: "Amazon.com Inc.", basePrice: 196.78, change: -0.31 },
  { sym: "META", name: "Meta Platforms Inc.", basePrice: 512.44, change: +2.1 },
  { sym: "NVDA", name: "NVIDIA Corp.", basePrice: 875.2, change: +3.47 },
];

function simulatePrices(stocks) {
  return stocks.map((s) => {
    const delta = (Math.random() - 0.49) * 0.8;
    const newPrice = Math.max(1, s.price + delta);
    const newChange = s.change + (Math.random() - 0.5) * 0.05;
    return { ...s, price: +newPrice.toFixed(2), change: +newChange.toFixed(2) };
  });
}

function initStocks() {
  return BASE_STOCKS.map((s) => ({ ...s, price: s.basePrice }));
}

// ── Storage helper ──────────────────────────────────────────────
function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [stocks, setStocks] = useState(initStocks);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockDropOpen, setStockDropOpen] = useState(false);

  const profileRef = useRef(null);
  const stockDropRef = useRef(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Load orders
  useEffect(() => {
    setOrders(getOrders());
  }, []);

  // Live price simulation — updates every 2s
  useEffect(() => {
    const id = setInterval(
      () => setStocks((prev) => simulatePrices(prev)),
      2000,
    );
    return () => clearInterval(id);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close stock dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (stockDropRef.current && !stockDropRef.current.contains(e.target))
        setStockDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  // ── Delete order ──────────────────────────────────────────────
  const handleDeleteOrder = (indexToDelete) => {
    const updated = orders.filter((_, i) => i !== indexToDelete);
    setOrders(updated);
    saveOrders(updated);
  };

  // Stats
  const totalRevenue = orders
    .filter((o) => o.type?.toLowerCase() === "sell")
    .reduce((sum, o) => sum + Number(o.price) * Number(o.quantity), 0);

  const activeOrders = orders.filter(
    (o) => o.type?.toLowerCase() === "buy",
  ).length;

  const filteredOrders = orders.filter(
    (o) =>
      search === "" ||
      o.type?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.price).includes(search) ||
      String(o.quantity).includes(search),
  );

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "SE";

  return (
    <div className="db-root">
      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <header className="db-navbar">
        <div className="db-nav-left">
          <div className="db-brand">
            <span className="db-brand-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </span>
            Stock Engine
          </div>
        </div>

        <div className="db-nav-center">
          <h1 className="db-page-title">Dashboard</h1>
        </div>

        <div className="db-nav-right">
          {/* Search */}
          <div className="db-search">
            <svg
              className="db-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="db-search-input"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Profile avatar + dropdown */}
          <div className="db-profile-wrap" ref={profileRef}>
            <button
              className="db-avatar"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Profile menu"
            >
              {initials}
            </button>

            {profileOpen && (
              <div className="db-dropdown">
                <div className="db-dropdown-user">
                  <span className="db-dropdown-avatar">{initials}</span>
                  <div>
                    <div className="db-dropdown-name">{user?.username}</div>
                    <div className="db-dropdown-role">Trader</div>
                  </div>
                </div>
                <div className="db-dropdown-divider" />
                <button className="db-logout-btn" onClick={handleLogout}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══ LIVE TICKER STRIP ═══════════════════════════════ */}
      <div className="db-ticker-wrap">
        <div className="db-ticker-track">
          {[...stocks, ...stocks].map((s, i) => (
            <div className="db-ticker-item" key={i}>
              <span className="db-ticker-sym">{s.sym}</span>
              <span className="db-ticker-price">
                $
                {s.price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span
                className={`db-ticker-change ${s.change >= 0 ? "up" : "down"}`}
              >
                {s.change >= 0 ? "+" : ""}
                {s.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ MAIN ════════════════════════════════════════════ */}
      <main className="db-main">
        {/* ── Stat cards ─────────────────────────────────── */}
        <section className="db-stats-row">
          <div className="db-stat-card dark">
            <div className="db-stat-label">Total Revenue</div>
            <div className="db-stat-value">
              $
              {totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="db-stat-sub up">
              <svg viewBox="0 0 16 16" fill="none">
                <polyline
                  points="2,12 6,7 10,9 14,4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              from sell orders
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-label">Active Buy Orders</div>
            <div className="db-stat-value">{activeOrders}</div>
            <div className="db-stat-sub up">
              <svg viewBox="0 0 16 16" fill="none">
                <polyline
                  points="2,12 6,7 10,9 14,4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              open positions
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-label">Total Orders</div>
            <div className="db-stat-value">{orders.length}</div>
            <div className="db-stat-sub neutral">
              <svg viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              all time
            </div>
          </div>
        </section>

        {/* ── Place Order card ────────────────────────────── */}
        <section className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Place Order</span>
            {selectedStock && (
              <span className="db-badge selected-stock-badge">
                {selectedStock.sym} · ${selectedStock.price.toFixed(2)}
              </span>
            )}
          </div>
          <div className="db-card-body">
            {/* ── Stock selector ───────────────────────── */}
            <div className="db-stock-selector" ref={stockDropRef}>
              <label className="db-form-label">Select Stock</label>
              <button
                className="db-stock-trigger"
                onClick={() => setStockDropOpen((v) => !v)}
              >
                {selectedStock ? (
                  <span className="db-stock-trigger-inner">
                    <span className="db-stock-trigger-sym">
                      {selectedStock.sym}
                    </span>
                    <span className="db-stock-trigger-name">
                      {selectedStock.name}
                    </span>
                    <span
                      className={`db-stock-trigger-price ${selectedStock.change >= 0 ? "up" : "down"}`}
                    >
                      ${selectedStock.price.toFixed(2)}
                      <em>
                        {selectedStock.change >= 0 ? "+" : ""}
                        {selectedStock.change.toFixed(2)}%
                      </em>
                    </span>
                  </span>
                ) : (
                  <span className="db-stock-trigger-placeholder">
                    Choose a stock to trade…
                  </span>
                )}
                <svg
                  className={`db-stock-trigger-caret ${stockDropOpen ? "open" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {stockDropOpen && (
                <div className="db-stock-dropdown">
                  {stocks.map((s) => (
                    <button
                      key={s.sym}
                      className={`db-stock-option ${selectedStock?.sym === s.sym ? "active" : ""}`}
                      onClick={() => {
                        setSelectedStock(s);
                        setStockDropOpen(false);
                      }}
                    >
                      <span className="db-sopt-sym">{s.sym}</span>
                      <span className="db-sopt-name">{s.name}</span>
                      <span
                        className={`db-sopt-price ${s.change >= 0 ? "up" : "down"}`}
                      >
                        ${s.price.toFixed(2)}
                        <em>
                          {s.change >= 0 ? "+" : ""}
                          {s.change.toFixed(2)}%
                        </em>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Order form ── */}
            <div className="db-order-form-wrap">
              <OrderForm setOrders={setOrders} selectedStock={selectedStock} />
            </div>
          </div>
        </section>

        {/* ── Order Book ──────────────────────────────────── */}
        <section className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Order Book</span>
            <span className="db-badge">{orders.length} orders</span>
          </div>
          <div className="db-card-body">
            {orders.length === 0 ? (
              <div className="db-empty">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="8" y="10" width="32" height="36" rx="3" />
                  <line x1="16" y1="20" x2="32" y2="20" />
                  <line x1="16" y1="28" x2="28" y2="28" />
                  <line x1="16" y1="36" x2="24" y2="36" />
                </svg>
                <p>No orders placed yet</p>
              </div>
            ) : (
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o, index) => {
                    const isBuy = o.type?.toLowerCase() === "buy";
                    const total = (
                      Number(o.price) * Number(o.quantity)
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                    return (
                      <tr key={index}>
                        <td>
                          <span
                            className={`db-type-pill ${isBuy ? "buy" : "sell"}`}
                          >
                            {o.type?.toUpperCase()}
                          </span>
                        </td>
                        <td className="db-td-mono">
                          ${Number(o.price).toLocaleString()}
                        </td>
                        <td className="db-td-mono">{o.quantity}</td>
                        <td className="db-td-mono">${total}</td>
                        <td>
                          <span className="db-status-pill paid">Placed</span>
                        </td>
                        {/* ── Delete button ── */}
                        <td>
                          <button
                            className="db-delete-btn"
                            onClick={() => handleDeleteOrder(index)}
                            aria-label="Delete order"
                            title="Delete order"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── Market Overview ─────────────────────────────── */}
        <section className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Market Overview</span>
            <span className="db-badge db-badge-live">
              <span className="db-live-dot" /> Live
            </span>
          </div>
          <div className="db-card-body">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s.sym}>
                    <td>
                      <span className="db-sym">{s.sym}</span>
                    </td>
                    <td className="db-td-name">{s.name}</td>
                    <td className="db-td-mono">
                      $
                      {s.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <span
                        className={`db-change ${s.change >= 0 ? "up" : "down"}`}
                      >
                        {s.change >= 0 ? "+" : ""}
                        {s.change.toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <svg
                        className={`db-sparkline ${s.change >= 0 ? "up" : "down"}`}
                        viewBox="0 0 60 24"
                        fill="none"
                      >
                        {s.change >= 0 ? (
                          <polyline
                            points="0,20 12,16 24,18 36,10 48,6 60,2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ) : (
                          <polyline
                            points="0,4 12,8 24,6 36,14 48,18 60,22"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
