import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import OrderManager from "./src/services/OrderManager.js";
import OrderGenerator from "./src/services/OrderGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Global state
let orderManager;
let orderGenerator;

// Stock configuration
const STOCKS = [
  { sym: "AAPL", name: "Apple Inc.", basePrice: 214.32 },
  { sym: "TSLA", name: "Tesla Inc.", basePrice: 172.56 },
  { sym: "MSFT", name: "Microsoft Corp.", basePrice: 418.9 },
  { sym: "GOOGL", name: "Alphabet Inc.", basePrice: 172.14 },
  { sym: "NIFTY", name: "Nifty 50 Index", basePrice: 22513 },
];

/**
 * Initialize server
 */
async function initializeServer() {
  try {
    console.log("Initializing Order Manager...");
    orderManager = new OrderManager();
    await orderManager.initialize(STOCKS);

    console.log("Initializing Order Generator...");
    orderGenerator = new OrderGenerator(orderManager, STOCKS);
    await orderGenerator.initializeOrderBook();
    orderGenerator.start();

    console.log("Server initialized successfully");
  } catch (err) {
    console.error("Error initializing server:", err);
    process.exit(1);
  }
}

/**
 * Routes
 */

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", generating: orderGenerator.isGenerating() });
});

// Place order
app.post("/api/orders", async (req, res) => {
  try {
    const { symbol, type, orderType, price, quantity, username } = req.body;

    if (!symbol || !type || !orderType || !quantity || !username) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["BUY", "SELL"].includes(type)) {
      return res.status(400).json({ error: "Invalid order type" });
    }

    if (!["MARKET", "LIMIT"].includes(orderType)) {
      return res
        .status(400)
        .json({ error: "Invalid order type (MARKET/LIMIT)" });
    }

    if (orderType === "LIMIT" && !price) {
      return res.status(400).json({ error: "Price required for limit order" });
    }

    const orderData = {
      id: "ORD_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      type,
      orderType,
      price: orderType === "LIMIT" ? parseFloat(price) : null,
      quantity: parseInt(quantity),
      username,
    };

    const result = await orderManager.placeOrder(symbol, orderData);
    res.json(result);
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get market data
app.get("/api/market-data", (req, res) => {
  try {
    const marketData = orderManager.getMarketData();
    res.json(marketData);
  } catch (err) {
    console.error("Error fetching market data:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get order book for symbol
app.get("/api/orderbook/:symbol", (req, res) => {
  try {
    const { symbol } = req.params;
    const orderBook = orderManager.getOrderBook(symbol);

    if (!orderBook) {
      return res.status(404).json({ error: "Symbol not found" });
    }

    const state = orderBook.getState();
    res.json(state);
  } catch (err) {
    console.error("Error fetching order book:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get transactions for symbol
app.get("/api/transactions/:symbol", (req, res) => {
  try {
    const { symbol } = req.params;
    const transactions = orderManager.getTransactionsBySymbol(symbol);
    res.json({ transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all transactions
app.get("/api/transactions", (req, res) => {
  try {
    const transactions = orderManager.getAllTransactions();
    res.json({ transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get stock configuration
app.get("/api/stocks", (req, res) => {
  res.json(STOCKS);
});

// Start/stop order generator
app.post("/api/generator/start", (req, res) => {
  orderGenerator.start();
  res.json({
    message: "Order generator started",
    running: orderGenerator.isGenerating(),
  });
});

app.post("/api/generator/stop", (req, res) => {
  orderGenerator.stop();
  res.json({
    message: "Order generator stopped",
    running: orderGenerator.isGenerating(),
  });
});

app.get("/api/generator/status", (req, res) => {
  res.json({ running: orderGenerator.isGenerating() });
});

/**
 * Start server
 */
async function startServer() {
  await initializeServer();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
