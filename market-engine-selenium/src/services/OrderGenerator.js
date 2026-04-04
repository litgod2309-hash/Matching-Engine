class OrderGenerator {
  constructor(orderManager, stocks) {
    this.orderManager = orderManager;
    this.stocks = stocks;
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * Generate random order ID
   */
  generateOrderId() {
    return "ORD_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate random quantity
   */
  generateQuantity() {
    return Math.floor(Math.random() * 91) + 10; // 10-100
  }

  /**
   * Generate random price based on last traded price or base price
   */
  generatePrice(basePrice, lastTradedPrice) {
    const reference = lastTradedPrice || basePrice;
    const deviation = reference * 0.05; // ±5%
    const randomDeviation = (Math.random() - 0.5) * 2 * deviation;
    const price = Math.max(1, reference + randomDeviation);
    return Math.round(price * 100) / 100; // 2 decimal places
  }

  /**
   * Create initial order book with 10 orders per stock
   */
  async initializeOrderBook() {
    for (const stock of this.stocks) {
      const orderBook = this.orderManager.getOrderBook(stock.sym);

      if (orderBook.orderBooks === undefined) {
        // Check if empty
        console.log(`Initializing order book for ${stock.sym}`);

        // 5 buy limit orders
        for (let i = 0; i < 5; i++) {
          const buyPrice =
            Math.round(
              stock.basePrice * (1 - 0.02 - Math.random() * 0.015) * 100,
            ) / 100;
          const order = {
            id: this.generateOrderId(),
            type: "BUY",
            orderType: "LIMIT",
            price: buyPrice,
            quantity: this.generateQuantity(),
            originalQuantity: this.generateQuantity(),
            timestamp: Date.now(),
            username: "system",
            symbol: stock.sym,
          };
          orderBook.addOrder(order);
        }

        // 5 sell limit orders
        for (let i = 0; i < 5; i++) {
          const sellPrice =
            Math.round(
              stock.basePrice * (1 + 0.005 + Math.random() * 0.015) * 100,
            ) / 100;
          const order = {
            id: this.generateOrderId(),
            type: "SELL",
            orderType: "LIMIT",
            price: sellPrice,
            quantity: this.generateQuantity(),
            originalQuantity: this.generateQuantity(),
            timestamp: Date.now(),
            username: "system",
            symbol: stock.sym,
          };
          orderBook.addOrder(order);
        }
      }
    }

    await this.orderManager.saveOrderBook();
  }

  /**
   * Generate single random order
   */
  async generateOrder() {
    // Pick random stock
    const stock = this.stocks[Math.floor(Math.random() * this.stocks.length)];
    const orderBook = this.orderManager.getOrderBook(stock.sym);

    // 50/50 BUY or SELL
    const type = Math.random() < 0.5 ? "BUY" : "SELL";

    // 50/50 MARKET or LIMIT
    const orderType = Math.random() < 0.5 ? "MARKET" : "LIMIT";

    const price = this.generatePrice(
      stock.basePrice,
      orderBook.lastTradedPrice,
    );
    const quantity = this.generateQuantity();

    const order = {
      id: this.generateOrderId(),
      type,
      orderType,
      price,
      quantity,
      originalQuantity: quantity,
      timestamp: Date.now(),
      username: "system", // Generated orders are from system
      symbol: stock.sym,
    };

    try {
      const result = await this.orderManager.placeOrder(stock.sym, order);
      return {
        success: result.success,
        symbol: stock.sym,
        transactions: result.transactions.length,
        lastPrice: result.lastTradedPrice,
      };
    } catch (err) {
      console.error("Error placing generated order:", err);
      return { success: false };
    }
  }

  /**
   * Start generating orders every second
   */
  start() {
    if (this.isRunning) return;

    console.log("Order generator started");
    this.isRunning = true;

    this.intervalId = setInterval(async () => {
      await this.generateOrder();
    }, 1000); // Every 1 second
  }

  /**
   * Stop generating orders
   */
  stop() {
    if (!this.isRunning) return;

    console.log("Order generator stopped");
    this.isRunning = false;
    clearInterval(this.intervalId);
  }

  /**
   * Check if running
   */
  isGenerating() {
    return this.isRunning;
  }
}

export default OrderGenerator;
