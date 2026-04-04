import { logoutUser } from "../services/storage";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="navbar">
      <span>Logged in as: {user?.username}</span>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
