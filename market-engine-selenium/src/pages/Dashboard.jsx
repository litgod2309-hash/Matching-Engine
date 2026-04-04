import { useEffect, useState, useRef } from "react";
import { getCurrentUser, setCurrentUser } from "../services/storage";
import { orderAPI } from "../services/api";
import OrderForm from "../components/OrderForm";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

// Initial stock configuration
const BASE_STOCKS = [
  { sym: "AAPL", name: "Apple Inc.", basePrice: 214.32 },
  { sym: "TSLA", name: "Tesla Inc.", basePrice: 172.56 },
  { sym: "MSFT", name: "Microsoft Corp.", basePrice: 418.9 },
  { sym: "GOOGL", name: "Alphabet Inc.", basePrice: 172.14 },
  { sym: "NIFTY", name: "Nifty 50 Index", basePrice: 22513 },
];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [marketSearch, setMarketSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [stocks, setStocks] = useState(
    BASE_STOCKS.map((s) => ({
      ...s,
      lastTradedPrice: s.basePrice,
      bestBid: null,
      bestAsk: null,
    })),
  );
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockDropOpen, setStockDropOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const profileRef = useRef(null);
  const stockDropRef = useRef(null);
  const marketDataIntervalRef = useRef(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Load market data on mount
  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const marketData = await orderAPI.getMarketData();

        setStocks((prevStocks) =>
          prevStocks.map((stock) => ({
            ...stock,
            lastTradedPrice:
              marketData[stock.sym]?.lastTradedPrice || stock.lastTradedPrice,
            bestBid: marketData[stock.sym]?.bestBid,
            bestAsk: marketData[stock.sym]?.bestAsk,
          })),
        );
      } catch (err) {
        console.error("Error loading market data:", err);
      }
    };

    loadMarketData();

    // Poll market data every second
    marketDataIntervalRef.current = setInterval(loadMarketData, 1000);

    return () => {
      if (marketDataIntervalRef.current) {
        clearInterval(marketDataIntervalRef.current);
      }
    };
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

  // Handle stock row click to navigate to detail page
  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  // Handle order placed
  const handleOrderPlaced = (result) => {
    // Reload market data
    const loadMarketData = async () => {
      try {
        const marketData = await orderAPI.getMarketData();
        setStocks((prevStocks) =>
          prevStocks.map((stock) => ({
            ...stock,
            lastTradedPrice:
              marketData[stock.sym]?.lastTradedPrice || stock.lastTradedPrice,
            bestBid: marketData[stock.sym]?.bestBid,
            bestAsk: marketData[stock.sym]?.bestAsk,
          })),
        );
      } catch (err) {
        console.error("Error loading market data:", err);
      }
    };
    loadMarketData();
  };

  // Filter stocks by market search
  const filteredStocks = stocks.filter(
    (s) =>
      marketSearch === "" ||
      s.sym.toLowerCase().includes(marketSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(marketSearch.toLowerCase()),
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
              placeholder="Search stocks..."
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
            <div
              className="db-ticker-item"
              key={i}
              onClick={() => handleStockClick(s.sym)}
              style={{ cursor: "pointer" }}
            >
              <span className="db-ticker-sym">{s.sym}</span>
              <span className="db-ticker-price">
                $
                {s.lastTradedPrice.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {s.bestBid && s.bestAsk && (
                <span className="db-ticker-spread">
                  B: ${s.bestBid.price.toFixed(2)} | A: $
                  {s.bestAsk.price.toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ══ MAIN ════════════════════════════════════════════ */}
      <main className="db-main">
        {/* ── Place Order card ────────────────────────────── */}
        <section className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Place Order</span>
            {selectedStock && (
              <span className="db-badge selected-stock-badge">
                {selectedStock.sym} · $
                {selectedStock.lastTradedPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="db-card-body">
            {/* ── Stock selector ─────────────────────���─── */}
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
                    <span className="db-stock-trigger-price">
                      ${selectedStock.lastTradedPrice.toFixed(2)}
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
                      <div className="db-sopt-prices">
                        <span className="db-sopt-price">
                          ${s.lastTradedPrice.toFixed(2)}
                        </span>
                        {s.bestBid && s.bestAsk && (
                          <span className="db-sopt-spread">
                            B: ${s.bestBid.price.toFixed(2)} | A: $
                            {s.bestAsk.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Order form ── */}
            <div className="db-order-form-wrap">
              <OrderForm
                setOrders={() => {}}
                selectedStock={selectedStock}
                username={user?.username}
                onOrderPlaced={handleOrderPlaced}
              />
            </div>
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
            {/* Market search input */}
            <div className="db-market-search">
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
                className="db-market-search-input"
                placeholder="Search stocks by symbol or name..."
                value={marketSearch}
                onChange={(e) => setMarketSearch(e.target.value)}
              />
            </div>

            <table className="db-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Last Price</th>
                  <th>Best Bid</th>
                  <th>Best Ask</th>
                  <th>Spread</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((s) => {
                  const spread =
                    s.bestBid && s.bestAsk
                      ? (
                          ((s.bestAsk.price - s.bestBid.price) /
                            s.bestBid.price) *
                          100
                        ).toFixed(2)
                      : null;

                  return (
                    <tr
                      key={s.sym}
                      className="db-clickable-row"
                      onClick={() => handleStockClick(s.sym)}
                    >
                      <td>
                        <span className="db-sym">{s.sym}</span>
                      </td>
                      <td className="db-td-name">{s.name}</td>
                      <td className="db-td-mono">
                        $
                        {s.lastTradedPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="db-td-mono bid">
                        {s.bestBid ? `$${s.bestBid.price.toFixed(2)}` : "N/A"}
                      </td>
                      <td className="db-td-mono ask">
                        {s.bestAsk ? `$${s.bestAsk.price.toFixed(2)}` : "N/A"}
                      </td>
                      <td className="db-td-mono spread">
                        {spread ? `${spread}%` : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
