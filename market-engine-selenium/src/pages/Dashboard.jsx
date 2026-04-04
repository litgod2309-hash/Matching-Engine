import { useEffect, useState } from "react";
import { getCurrentUser, getOrders } from "../services/storage";
import Navbar from "../components/Navbar";
import OrderForm from "../components/OrderForm";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  return (
    <div className="app-container">
      <Navbar user={user} />

      <h1>Dashboard</h1>

      <div className="card">
        <OrderForm setOrders={setOrders} />
      </div>

      <div className="card">
        <h3>All Orders</h3>
        <ul className="order-list">
          {orders.map((o, index) => (
            <li className="order-item" key={index}>
              <span>{o.type}</span>
              <span>{o.price}</span>
              <span>{o.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
