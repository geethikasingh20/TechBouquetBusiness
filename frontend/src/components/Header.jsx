import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { items, logoutCart } = useCart();
  const { user, logout } = useAuth();
  const [location, setLocation] = useState("Detecting...");
  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("Bengaluru");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setLocation("Bengaluru"),
      () => setLocation("Bengaluru")
    );
  }, []);

  const handleLogout = () => {
    logoutCart();
    logout();
  };

  return (
    <header className="site-header">
      <div className="header-left">
        <Link to="/" className="logo">TechBouquet</Link>
        <span className="location">{location}</span>
      </div>
      <SearchBar />
      <div className="header-actions">
        {!user && (
          <>
            <button className="ghost" onClick={() => navigate("/login")}>Login</button>
            <button className="primary" onClick={() => navigate("/register")}>Register</button>
          </>
        )}
        {user && (
          <>
            <span className="welcome">Welcome {user.name}</span>
            {!user.emailVerified && (
              <button className="ghost" onClick={() => navigate("/login")}>Verify Email</button>
            )}
            <button className="ghost" onClick={handleLogout}>Logout</button>
          </>
        )}
        <Link to="/cart" className="icon-button">
          Tokri ({items.length})
        </Link>
        {user && (
          <>
            <button className="icon-button" type="button">Menu</button>
            <Link to="/profile" className="icon-button">Profile</Link>
          </>
        )}
      </div>
    </header>
  );
}
