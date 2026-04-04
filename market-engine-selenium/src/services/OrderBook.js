import RedBlackTree from "../utils/RedBlackTree.js";

class OrderBook {
  constructor(symbol) {
    this.symbol = symbol;
    // Buy orders: sorted by price DESCENDING (highest first)
    this.buyOrders = new RedBlackTree((a, b) => b - a);
    // Sell orders: sorted by price ASCENDING (lowest first)
    this.sellOrders = new RedBlackTree((a, b) => a - b);
    this.lastTradedPrice = null;
    this.trades = [];
  }

  /**
   * Add new order (BUY or SELL)
   */
  addOrder(order) {
    if (order.type === "BUY") {
      this.buyOrders.insert(order.price, order);
    } else {
      this.sellOrders.insert(order.price, order);
    }
  }

  /**
   * Remove order by ID
   */
  removeOrder(orderId, side) {
    const book = side === "BUY" ? this.buyOrders : this.sellOrders;

    // Find and remove the order
    const allNodes = book.inOrder();
    for (const node of allNodes) {
      if (book.removeOrderAtPrice(node.price, orderId)) {
        // If price level is empty, remove the node
        book._removeNode(node);
      }
    }
  }

  /**
   * Get best bid (highest buy price)
   */
  getBestBid() {
    const maxNode = this.buyOrders.getMax();
    if (maxNode && maxNode.orders.length > 0) {
      return {
        price: maxNode.price,
        quantity: maxNode.orders.reduce((sum, o) => sum + o.quantity, 0),
        orderCount: maxNode.orders.length,
      };
    }
    return null;
  }

  /**
   * Get best ask (lowest sell price)
   */
  getBestAsk() {
    const minNode = this.sellOrders.getMin();
    if (minNode && minNode.orders.length > 0) {
      return {
        price: minNode.price,
        quantity: minNode.orders.reduce((sum, o) => sum + o.quantity, 0),
        orderCount: minNode.orders.length,
      };
    }
    return null;
  }

  /**
   * Match incoming order with existing orders
   * Returns: { matched: true/false, transactions: [], remainingQuantity }
   */
  matchOrder(incomingOrder) {
    const transactions = [];
    let remainingQuantity = incomingOrder.quantity;

    if (incomingOrder.type === "BUY") {
      // Match against SELL orders (lowest price first)
      const sellNodes = this.sellOrders.inOrder();

      for (const sellNode of sellNodes) {
        if (remainingQuantity <= 0) break;

        // For market orders OR if limit price >= best ask
        if (
          incomingOrder.orderType === "MARKET" ||
          incomingOrder.price >= sellNode.price
        ) {
          // Process all orders at this price level (FIFO)
          while (sellNode.orders.length > 0 && remainingQuantity > 0) {
            const existingOrder = sellNode.orders[0]; // First in queue (FIFO)

            const matchQuantity = Math.min(
              remainingQuantity,
              existingOrder.quantity,
            );
            const matchPrice = existingOrder.price; // Use seller's price

            // Create transaction
            const transaction = {
              transactionId: incomingOrder.id + existingOrder.id,
              buyOrderId: incomingOrder.id,
              sellOrderId: existingOrder.id,
              price: matchPrice,
              quantity: matchQuantity,
              timestamp: Date.now(),
              symbol: this.symbol,
              buyerUsername: incomingOrder.username,
              sellerUsername: existingOrder.username,
            };

            transactions.push(transaction);
            this.lastTradedPrice = matchPrice;
            this.trades.push(transaction);

            // Update quantities
            remainingQuantity -= matchQuantity;
            existingOrder.quantity -= matchQuantity;

            // Remove order if fully filled
            if (existingOrder.quantity === 0) {
              sellNode.orders.shift(); // Remove from queue (FIFO)
            }
          }

          // Remove price level if empty
          if (sellNode.orders.length === 0) {
            this.sellOrders._removeNode(sellNode);
          }
        } else {
          // Incoming limit order price is below ask - stop matching
          break;
        }
      }
    } else {
      // SELL order - match against BUY orders (highest price first)
      const buyNodes = this.buyOrders.reverseOrder();

      for (const buyNode of buyNodes) {
        if (remainingQuantity <= 0) break;

        // For market orders OR if limit price <= best bid
        if (
          incomingOrder.orderType === "MARKET" ||
          incomingOrder.price <= buyNode.price
        ) {
          // Process all orders at this price level (FIFO)
          while (buyNode.orders.length > 0 && remainingQuantity > 0) {
            const existingOrder = buyNode.orders[0]; // First in queue (FIFO)

            const matchQuantity = Math.min(
              remainingQuantity,
              existingOrder.quantity,
            );
            const matchPrice = existingOrder.price; // Use buyer's price

            // Create transaction
            const transaction = {
              transactionId: existingOrder.id + incomingOrder.id,
              buyOrderId: existingOrder.id,
              sellOrderId: incomingOrder.id,
              price: matchPrice,
              quantity: matchQuantity,
              timestamp: Date.now(),
              symbol: this.symbol,
              buyerUsername: existingOrder.username,
              sellerUsername: incomingOrder.username,
            };

            transactions.push(transaction);
            this.lastTradedPrice = matchPrice;
            this.trades.push(transaction);

            // Update quantities
            remainingQuantity -= matchQuantity;
            existingOrder.quantity -= matchQuantity;

            // Remove order if fully filled
            if (existingOrder.quantity === 0) {
              buyNode.orders.shift(); // Remove from queue (FIFO)
            }
          }

          // Remove price level if empty
          if (buyNode.orders.length === 0) {
            this.buyOrders._removeNode(buyNode);
          }
        } else {
          // Incoming limit order price is above bid - stop matching
          break;
        }
      }
    }

    // If it's a market order with unmatched quantity, it's rejected
    // If it's a limit order with unmatched quantity, add to book
    if (remainingQuantity > 0) {
      if (incomingOrder.orderType === "LIMIT") {
        const remainingOrder = {
          ...incomingOrder,
          quantity: remainingQuantity,
          originalQuantity: incomingOrder.originalQuantity,
        };
        this.addOrder(remainingOrder);
      }
      // Market order with partial fill is rejected (not added)
    }

    return {
      matched: transactions.length > 0,
      transactions,
      remainingQuantity,
    };
  }

  /**
   * Get order book state for persistence
   */
  getState() {
    const buyOrders = [];
    const sellOrders = [];

    for (const node of this.buyOrders.inOrder()) {
      for (const order of node.orders) {
        buyOrders.push(order);
      }
    }

    for (const node of this.sellOrders.inOrder()) {
      for (const order of node.orders) {
        sellOrders.push(order);
      }
    }

    return {
      symbol: this.symbol,
      buyOrders,
      sellOrders,
      lastTradedPrice: this.lastTradedPrice,
    };
  }

  /**
   * Restore order book from state
   */
  restoreState(state) {
    this.clear();
    this.lastTradedPrice = state.lastTradedPrice;

    for (const order of state.buyOrders) {
      this.buyOrders.insert(order.price, order);
    }

    for (const order of state.sellOrders) {
      this.sellOrders.insert(order.price, order);
    }
  }

  /**
   * Clear order book
   */
  clear() {
    this.buyOrders.clear();
    this.sellOrders.clear();
    this.trades = [];
  }

  /**
   * Get trade history for this stock
   */
  getTradeHistory() {
    return this.trades;
  }
}

export default OrderBook;
