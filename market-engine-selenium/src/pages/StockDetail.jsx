import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser, setCurrentUser } from "../services/storage";
import { orderAPI } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/StockDetail.css";

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch stock data and transactions on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const marketData = await orderAPI.getMarketData();
        const stockData = marketData[symbol?.toUpperCase()];

        if (stockData) {
          setStock({
            sym: symbol?.toUpperCase(),
            lastTradedPrice: stockData.lastTradedPrice,
            bestBid: stockData.bestBid,
            bestAsk: stockData.bestAsk,
          });

          // Load transactions
          const { transactions } = await orderAPI.getTransactionsBySymbol(
            symbol?.toUpperCase(),
          );
          setRecentTransactions(transactions.slice(-10).reverse());

          // Build chart data
          const chartPoints = transactions.map((t, idx) => ({
            time: new Date(t.timestamp).toLocaleTimeString(),
            price: t.price,
            quantity: t.quantity,
          }));
          setChartData(chartPoints);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setLoading(false);
      }
    };

    if (symbol) {
      loadData();
      const interval = setInterval(loadData, 2000);
      return () => clearInterval(interval);
    }
  }, [symbol]);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "SE";

  if (loading) {
    return (
      <div className="sd-root">
        <p className="loading">Loading...</p>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="sd-root">
        <header className="sd-navbar">
          <div className="sd-nav-left">
            <button className="sd-back-btn" onClick={handleBack}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
          </div>
        </header>
        <main className="sd-main">
          <div className="sd-not-found">
            <p>Stock "{symbol}" not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="sd-root">
      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <header className="sd-navbar">
        <div className="sd-nav-left">
          <button className="sd-back-btn" onClick={handleBack}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="sd-nav-center">
          <h1 className="sd-page-title">{stock.sym}</h1>
        </div>

        <div className="sd-nav-right">
          <div className="sd-profile-wrap">
            <button
              className="sd-avatar"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Profile menu"
            >
              {initials}
            </button>

            {profileOpen && (
              <div className="sd-dropdown">
                <div className="sd-dropdown-user">
                  <span className="sd-dropdown-avatar">{initials}</span>
                  <div>
                    <div className="sd-dropdown-name">{user?.username}</div>
                    <div className="sd-dropdown-role">Trader</div>
                  </div>
                </div>
                <div className="sd-dropdown-divider" />
                <button className="sd-logout-btn" onClick={handleLogout}>
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

      {/* ══ MAIN ════════════════════════════════════════════ */}
      <main className="sd-main">
        {/* ── Stock Header Card ──────────────────────────── */}
        <section className="sd-card sd-header-card">
          <div className="sd-stock-header">
            <div className="sd-stock-title">
              <h1 className="sd-stock-name">{stock.sym}</h1>
            </div>

            <div className="sd-stock-price-section">
              <div className="sd-price-main">
                <span className="sd-price-label">Last Traded Price</span>
                <span className="sd-price-value">
                  $
                  {stock.lastTradedPrice
                    ? stock.lastTradedPrice.toFixed(2)
                    : "N/A"}
                </span>
              </div>

              {stock.bestBid && (
                <div className="sd-price-main">
                  <span className="sd-price-label bid-label">Best Bid</span>
                  <span className="sd-price-value bid">
                    ${stock.bestBid.price.toFixed(2)}
                  </span>
                </div>
              )}

              {stock.bestAsk && (
                <div className="sd-price-main">
                  <span className="sd-price-label ask-label">Best Ask</span>
                  <span className="sd-price-value ask">
                    ${stock.bestAsk.price.toFixed(2)}
                  </span>
                </div>
              )}

              {stock.bestBid && stock.bestAsk && (
                <div className="sd-price-main">
                  <span className="sd-price-label">Spread</span>
                  <span className="sd-price-value spread">
                    ${(stock.bestAsk.price - stock.bestBid.price).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Price History Chart ────────────────────────– */}
        <section className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title">Price History</span>
          </div>
          <div className="sd-card-body">
            {chartData.length > 0 ? (
              <div className="sd-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `$${value.toFixed(2)}`}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#22c55e"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="sd-placeholder">
                <p>No trading data available yet</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Recent Transactions ────────────────────────– */}
        <section className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title">Recent Transactions</span>
            <span className="sd-badge">{recentTransactions.length}</span>
          </div>
          <div className="sd-card-body">
            {recentTransactions.length > 0 ? (
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((t) => (
                    <tr key={t.transactionId}>
                      <td className="sd-time">
                        {new Date(t.timestamp).toLocaleTimeString()}
                      </td>
                      <td>
                        <span className="sd-type buy">BUY/SELL</span>
                      </td>
                      <td className="sd-mono">${t.price.toFixed(2)}</td>
                      <td className="sd-mono">{t.quantity}</td>
                      <td className="sd-user">{t.buyerUsername}</td>
                      <td className="sd-user">{t.sellerUsername}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="sd-placeholder">
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
