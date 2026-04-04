import { useState } from "react";
import { getOrders, saveOrders } from "../services/storage";

export default function OrderForm({ setOrders }) {
  const [type, setType] = useState("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = () => {
    if (!price || !quantity) {
      alert("Enter valid inputs");
      return;
    }

    const newOrder = {
      type,
      price: Number(price),
      quantity: Number(quantity),
      timestamp: Date.now(),
    };

    const existing = getOrders();
    const updated = [...existing, newOrder];

    saveOrders(updated);
    setOrders(updated);

    setPrice("");
    setQuantity("");
  };

  return (
    <div>
      <h3>Place Order</h3>

      <div className="form-row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}
