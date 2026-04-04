import { logoutUser } from "../services/storage";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Trade<span>X</span>
      </div>
      <div className="navbar-right">
        {user && (
          <div className="navbar-user">
            <span className="navbar-user-dot" />
            {user.username}
          </div>
        )}
      </div>
    </nav>
  );
}
