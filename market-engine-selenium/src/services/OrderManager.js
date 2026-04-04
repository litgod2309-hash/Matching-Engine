import OrderBook from "./OrderBook.js";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OrderManager {
  constructor() {
    this.orderBooks = new Map();
    this.allTransactions = [];
    this.dataDir = path.join(__dirname, "../../data");
  }

  /**
   * Initialize order manager - load data from files
   */
  async initialize(stocks) {
    await this._ensureDataDir();

    for (const stock of stocks) {
      this.orderBooks.set(stock.sym, new OrderBook(stock.sym));
    }

    await this.loadOrderBook();
    await this.loadTransactions();
  }

  /**
   * Ensure data directory exists
   */
  async _ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (err) {
      console.error("Error creating data directory:", err);
    }
  }

  /**
   * Place order - match and store
   */
  async placeOrder(symbol, orderData) {
    const orderBook = this.orderBooks.get(symbol);
    if (!orderBook) {
      throw new Error(`Order book not found for ${symbol}`);
    }

    const order = {
      id: orderData.id,
      type: orderData.type, // BUY or SELL
      orderType: orderData.orderType, // MARKET or LIMIT
      price: orderData.price,
      quantity: orderData.quantity,
      originalQuantity: orderData.quantity,
      timestamp: Date.now(),
      username: orderData.username,
      symbol,
    };

    // Match order
    const result = orderBook.matchOrder(order);

    // Save transactions
    if (result.transactions.length > 0) {
      this.allTransactions.push(...result.transactions);
      await this.saveTransactions();
    }

    // Save order book
    await this.saveOrderBook();

    return {
      success: result.transactions.length > 0 || result.remainingQuantity === 0,
      transactions: result.transactions,
      remainingQuantity: result.remainingQuantity,
      lastTradedPrice: orderBook.lastTradedPrice,
    };
  }

  /**
   * Save order book to file
   */
  async saveOrderBook() {
    try {
      const orderBookState = {};

      for (const [symbol, book] of this.orderBooks) {
        orderBookState[symbol] = book.getState();
      }

      const filePath = path.join(this.dataDir, "orderbook.json");
      await fs.writeFile(filePath, JSON.stringify(orderBookState, null, 2));
    } catch (err) {
      console.error("Error saving order book:", err);
    }
  }

  /**
   * Load order book from file
   */
  async loadOrderBook() {
    try {
      const filePath = path.join(this.dataDir, "orderbook.json");
      const data = await fs.readFile(filePath, "utf8");
      const orderBookState = JSON.parse(data);

      for (const [symbol, state] of Object.entries(orderBookState)) {
        const book = this.orderBooks.get(symbol);
        if (book) {
          book.restoreState(state);
        }
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error("Error loading order book:", err);
      }
    }
  }

  /**
   * Save transactions to file
   */
  async saveTransactions() {
    try {
      const filePath = path.join(this.dataDir, "transactions.json");
      await fs.writeFile(
        filePath,
        JSON.stringify({ transactions: this.allTransactions }, null, 2),
      );
    } catch (err) {
      console.error("Error saving transactions:", err);
    }
  }

  /**
   * Load transactions from file
   */
  async loadTransactions() {
    try {
      const filePath = path.join(this.dataDir, "transactions.json");
      const data = await fs.readFile(filePath, "utf8");
      const { transactions } = JSON.parse(data);
      this.allTransactions = transactions || [];
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error("Error loading transactions:", err);
      }
    }
  }

  /**
   * Get order book for symbol
   */
  getOrderBook(symbol) {
    return this.orderBooks.get(symbol);
  }

  /**
   * Get market data for all symbols
   */
  getMarketData() {
    const data = {};

    for (const [symbol, book] of this.orderBooks) {
      const bestBid = book.getBestBid();
      const bestAsk = book.getBestAsk();

      data[symbol] = {
        lastTradedPrice: book.lastTradedPrice,
        bestBid,
        bestAsk,
        tradeCount: book.trades.length,
      };
    }

    return data;
  }

  /**
   * Get trades for symbol
   */
  getTrades(symbol) {
    const book = this.orderBooks.get(symbol);
    return book ? book.getTradeHistory() : [];
  }

  /**
   * Get all transactions
   */
  getAllTransactions() {
    return this.allTransactions;
  }

  /**
   * Get transactions for symbol
   */
  getTransactionsBySymbol(symbol) {
    return this.allTransactions.filter((t) => t.symbol === symbol);
  }
}

export default OrderManager;
