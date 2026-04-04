import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StockDetail from "./pages/StockDetail";
import { getCurrentUser } from "./services/storage";

function App() {
  const user = getCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
        <Route
          path="/stock/:symbol"
          element={user ? <StockDetail /> : <Login />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
