import { useState } from "react";
import { getUsers, saveUsers, setCurrentUser } from "../services/storage";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    let users = getUsers();

    let user = users.find((u) => u.username === username);

    if (!user) {
      user = { username };
      users.push(user);
      saveUsers(users);
    }

    setCurrentUser(user);
    navigate("/dashboard");
  };
  return (
    <div className="app-container">
      <div className="card">
        <h2>Login</h2>

        <input
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button onClick={handleLogin}>Login / Signup</button>
      </div>
    </div>
  );
}
