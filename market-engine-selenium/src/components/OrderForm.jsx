import { useState } from "react";
import { orderAPI } from "../services/api";
import "../styles/OrderForm.css";

export default function OrderForm({
  setOrders,
  selectedStock,
  username,
  onOrderPlaced,
}) {
  const [orderType, setOrderType] = useState("BUY");
  const [orderMode, setOrderMode] = useState("LIMIT");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!selectedStock) {
      setError("Please select a stock");
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      setError("Please enter valid quantity");
      return;
    }

    if (orderMode === "LIMIT" && (!price || parseFloat(price) <= 0)) {
      setError("Please enter valid price for limit order");
      return;
    }

    if (!username) {
      setError("User not logged in");
      return;
    }

    setLoading(true);

    try {
      const result = await orderAPI.placeOrder(
        selectedStock.sym,
        orderType,
        orderMode,
        parseInt(quantity),
        orderMode === "LIMIT" ? parseFloat(price) : null,
        username,
      );

      if (result.success || result.transactions.length > 0) {
        setSuccess(
          `Order ${orderMode === "MARKET" ? "matched" : "placed"}! ${result.transactions.length} transaction(s) completed.`,
        );
        setPrice("");
        setQuantity("");

        // Notify parent
        if (onOrderPlaced) {
          onOrderPlaced(result);
        }
      } else if (result.remainingQuantity > 0 && orderMode === "LIMIT") {
        setSuccess(
          `Limit order placed for ${result.remainingQuantity} shares (partial match)`,
        );
        setPrice("");
        setQuantity("");
        if (onOrderPlaced) {
          onOrderPlaced(result);
        }
      } else {
        setError("No matching orders found for market order");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Error placing order",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-form-container">
      {/* Order Type Selection */}
      <div className="form-section">
        <label className="form-label">Order Type</label>
        <div className="order-type-buttons">
          <button
            className={`type-btn ${orderType === "BUY" ? "active buy" : ""}`}
            onClick={() => setOrderType("BUY")}
            disabled={loading}
          >
            BUY
          </button>
          <button
            className={`type-btn ${orderType === "SELL" ? "active sell" : ""}`}
            onClick={() => setOrderType("SELL")}
            disabled={loading}
          >
            SELL
          </button>
        </div>
      </div>

      {/* Order Mode Selection */}
      <div className="form-section">
        <label className="form-label">Order Mode</label>
        <div className="order-mode-buttons">
          <button
            className={`mode-btn ${orderMode === "MARKET" ? "active" : ""}`}
            onClick={() => setOrderMode("MARKET")}
            disabled={loading}
          >
            MARKET
            <span className="mode-desc">Instant execution</span>
          </button>
          <button
            className={`mode-btn ${orderMode === "LIMIT" ? "active" : ""}`}
            onClick={() => setOrderMode("LIMIT")}
            disabled={loading}
          >
            LIMIT
            <span className="mode-desc">Price specified</span>
          </button>
        </div>
      </div>

      {/* Quantity Input */}
      <div className="form-section">
        <label className="form-label">Quantity (shares)</label>
        <input
          type="number"
          className="form-input"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={loading}
          min="1"
        />
      </div>

      {/* Price Input - Only for Limit Orders */}
      {orderMode === "LIMIT" && (
        <div className="form-section">
          <label className="form-label">Limit Price ($)</label>
          <div className="price-input-wrapper">
            <input
              type="number"
              className="form-input"
              placeholder="Enter limit price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={loading}
              step="0.01"
              min="0.01"
            />
            {selectedStock && (
              <span className="market-price-hint">
                Current: $
                {selectedStock.lastTradedPrice
                  ? selectedStock.lastTradedPrice.toFixed(2)
                  : "N/A"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Selected Stock Info */}
      {selectedStock && (
        <div className="stock-info">
          <div className="info-item">
            <span className="info-label">Stock:</span>
            <span className="info-value">{selectedStock.sym}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Price:</span>
            <span className="info-value">
              $
              {selectedStock.lastTradedPrice
                ? selectedStock.lastTradedPrice.toFixed(2)
                : "N/A"}
            </span>
          </div>
          {selectedStock.bestBid && (
            <div className="info-item">
              <span className="info-label">Best Bid:</span>
              <span className="info-value bid">
                ${selectedStock.bestBid.price.toFixed(2)}
              </span>
            </div>
          )}
          {selectedStock.bestAsk && (
            <div className="info-item">
              <span className="info-label">Best Ask:</span>
              <span className="info-value ask">
                ${selectedStock.bestAsk.price.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {error && <div className="message error-message">{error}</div>}
      {success && <div className="message success-message">{success}</div>}

      {/* Submit Button */}
      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={loading || !selectedStock}
      >
        {loading ? "Processing..." : `${orderType} ${orderMode}`}
      </button>
    </div>
  );
}
