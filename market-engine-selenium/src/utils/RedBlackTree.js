/**
 * Red-Black Tree Node
 */
class RBNode {
  constructor(price, order = null) {
    this.price = price;
    this.orders = order ? [order] : []; // Orders at this price (queue - FIFO)
    this.color = "RED";
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

/**
 * Red-Black Tree for Order Book
 * Orders sorted by price, with FIFO for same price
 */
class RedBlackTree {
  constructor(compareFn = (a, b) => a - b) {
    this.root = null;
    this.compareFn = compareFn;
    this.size = 0;
  }

  /**
   * Insert or add order to existing price node
   */
  insert(price, order) {
    if (!this.root) {
      this.root = new RBNode(price, order);
      this.root.color = "BLACK";
      this.size++;
      return;
    }

    let current = this.root;
    let parent = null;

    // Find insertion point
    while (current) {
      parent = current;
      const cmp = this.compareFn(price, current.price);

      if (cmp < 0) {
        current = current.left;
      } else if (cmp > 0) {
        current = current.right;
      } else {
        // Same price - add to queue (FIFO)
        current.orders.push(order);
        this.size++;
        return;
      }
    }

    // Create new node
    const newNode = new RBNode(price, order);
    newNode.parent = parent;

    const cmp = this.compareFn(price, parent.price);
    if (cmp < 0) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    this.size++;
    this._fixInsert(newNode);
  }

  /**
   * Fix Red-Black Tree properties after insertion
   */
  _fixInsert(node) {
    while (node.parent && node.parent.color === "RED") {
      if (node.parent === node.parent.parent?.left) {
        const uncle = node.parent.parent.right;

        if (uncle && uncle.color === "RED") {
          node.parent.color = "BLACK";
          uncle.color = "BLACK";
          node.parent.parent.color = "RED";
          node = node.parent.parent;
        } else {
          if (node === node.parent.right) {
            node = node.parent;
            this._rotateLeft(node);
          }
          node.parent.color = "BLACK";
          node.parent.parent.color = "RED";
          this._rotateRight(node.parent.parent);
        }
      } else {
        const uncle = node.parent.parent?.left;

        if (uncle && uncle.color === "RED") {
          node.parent.color = "BLACK";
          uncle.color = "BLACK";
          node.parent.parent.color = "RED";
          node = node.parent.parent;
        } else {
          if (node === node.parent.left) {
            node = node.parent;
            this._rotateRight(node);
          }
          node.parent.color = "BLACK";
          node.parent.parent.color = "RED";
          this._rotateLeft(node.parent.parent);
        }
      }
    }
    this.root.color = "BLACK";
  }

  /**
   * Rotate left
   */
  _rotateLeft(node) {
    const rightChild = node.right;
    node.right = rightChild.left;

    if (rightChild.left) {
      rightChild.left.parent = node;
    }

    rightChild.parent = node.parent;
    if (!node.parent) {
      this.root = rightChild;
    } else if (node === node.parent.left) {
      node.parent.left = rightChild;
    } else {
      node.parent.right = rightChild;
    }

    rightChild.left = node;
    node.parent = rightChild;
  }

  /**
   * Rotate right
   */
  _rotateRight(node) {
    const leftChild = node.left;
    node.left = leftChild.right;

    if (leftChild.right) {
      leftChild.right.parent = node;
    }

    leftChild.parent = node.parent;
    if (!node.parent) {
      this.root = leftChild;
    } else if (node === node.parent.right) {
      node.parent.right = leftChild;
    } else {
      node.parent.left = leftChild;
    }

    leftChild.right = node;
    node.parent = leftChild;
  }

  /**
   * Get minimum node (leftmost)
   */
  getMin() {
    let current = this.root;
    while (current?.left) {
      current = current.left;
    }
    return current;
  }

  /**
   * Get maximum node (rightmost)
   */
  getMax() {
    let current = this.root;
    while (current?.right) {
      current = current.right;
    }
    return current;
  }

  /**
   * Find node by price
   */
  findByPrice(price) {
    let current = this.root;
    while (current) {
      const cmp = this.compareFn(price, current.price);
      if (cmp < 0) {
        current = current.left;
      } else if (cmp > 0) {
        current = current.right;
      } else {
        return current;
      }
    }
    return null;
  }

  /**
   * Remove order from queue at price
   * Returns true if price node should be removed
   */
  removeOrderAtPrice(price, orderId) {
    const node = this.findByPrice(price);
    if (!node) return false;

    const idx = node.orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      node.orders.splice(idx, 1);
      this.size--;

      // Return true if this price level should be removed
      return node.orders.length === 0;
    }
    return false;
  }

  /**
   * Remove entire price node
   */
  _removeNode(node) {
    if (!node.left && !node.right) {
      if (node === this.root) {
        this.root = null;
      } else if (node.parent.left === node) {
        node.parent.left = null;
      } else {
        node.parent.right = null;
      }
      return;
    }

    if (!node.left || !node.right) {
      const child = node.left || node.right;
      if (node === this.root) {
        this.root = child;
        child.parent = null;
      } else if (node.parent.left === node) {
        node.parent.left = child;
        child.parent = node.parent;
      } else {
        node.parent.right = child;
        child.parent = node.parent;
      }
      return;
    }

    const successor = this._findSuccessor(node);
    node.price = successor.price;
    node.orders = successor.orders;
    this._removeNode(successor);
  }

  /**
   * Find in-order successor
   */
  _findSuccessor(node) {
    let current = node.right;
    while (current.left) {
      current = current.left;
    }
    return current;
  }

  /**
   * Get all nodes in sorted order
   */
  inOrder(node = this.root, result = []) {
    if (!node) return result;
    this.inOrder(node.left, result);
    result.push(node);
    this.inOrder(node.right, result);
    return result;
  }

  /**
   * Get all nodes in reverse order
   */
  reverseOrder(node = this.root, result = []) {
    if (!node) return result;
    this.reverseOrder(node.right, result);
    result.push(node);
    this.reverseOrder(node.left, result);
    return result;
  }

  /**
   * Clear tree
   */
  clear() {
    this.root = null;
    this.size = 0;
  }

  /**
   * Check if empty
   */
  isEmpty() {
    return this.size === 0;
  }
}

export default RedBlackTree;
