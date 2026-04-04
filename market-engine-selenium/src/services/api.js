import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const orderAPI = {
  // Place new order
  placeOrder: async (
    symbol,
    type,
    orderType,
    quantity,
    price = null,
    username,
  ) => {
    const response = await api.post("/orders", {
      symbol,
      type,
      orderType,
      price,
      quantity,
      username,
    });
    return response.data;
  },

  // Get market data (best bid/ask/last price for all stocks)
  getMarketData: async () => {
    const response = await api.get("/market-data");
    return response.data;
  },

  // Get order book for a symbol
  getOrderBook: async (symbol) => {
    const response = await api.get(`/orderbook/${symbol}`);
    return response.data;
  },

  // Get transactions for a symbol
  getTransactionsBySymbol: async (symbol) => {
    const response = await api.get(`/transactions/${symbol}`);
    return response.data;
  },

  // Get all transactions
  getAllTransactions: async () => {
    const response = await api.get("/transactions");
    return response.data;
  },

  // Get stocks configuration
  getStocks: async () => {
    const response = await api.get("/stocks");
    return response.data;
  },

  // Generator controls
  startGenerator: async () => {
    const response = await api.post("/generator/start");
    return response.data;
  },

  stopGenerator: async () => {
    const response = await api.post("/generator/stop");
    return response.data;
  },

  getGeneratorStatus: async () => {
    const response = await api.get("/generator/status");
    return response.data;
  },
};

export default api;
