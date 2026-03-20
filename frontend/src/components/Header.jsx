import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const [location, setLocation] = useState({ city: "", state: "", pincode: "" });
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [items]);

  useEffect(() => {
    const fallback = { city: "Bengaluru", state: "Karnataka", pincode: "" };
    if (!navigator.geolocation) {
      setLocation(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`
          );
          const data = await response.json();
          const address = data?.address || {};
          const city = address.city || address.town || address.village || address.county || "";
          const state = address.state || "";
          const pincode = address.postcode || address.postalcode || address.zip || "";
          if (city || state || pincode) {
            setLocation({
              city: city || fallback.city,
              state: state || fallback.state,
              pincode
            });
          } else {
            setLocation(fallback);
          }
        } catch (error) {
          setLocation(fallback);
        }
      },
      () => setLocation(fallback)
    );
  }, []);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      setLoggingOut(false);
    }, 800);
  };

  const displayName = user?.name ? user.name : "Guest";
  const profileLink = user ? "/profile" : "/login";

  return (
    <header className="site-header">
      <div className="header-left">
        <Link to="/" className="logo">TechBouquet</Link>
        <div className="location-block">
          <span className="deliver">Deliver to {location.state || ""}</span>
          <span className="city">
            {location.city || ""}{location.pincode ? ` - ${location.pincode}` : ""}
          </span>
        </div>
      </div>
      <SearchBar />
      <div className="header-actions">
        {!user && !loggingOut && (
          <>
            <button className="ghost" onClick={() => navigate("/login")}>Login</button>
            <button className="primary" onClick={() => navigate("/register")}>Register</button>
          </>
        )}
        {user && (
          <button className="ghost" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        )}
        {loggingOut && !user && (
          <span className="logout-status">Logged out</span>
        )}
        <Link to="/cart" className="icon-button">
          Tokri ({totalQuantity})
        </Link>
        <Link to={profileLink} className="icon-button profile-link">
          <span className="profile-avatar" aria-hidden="true">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="22" r="12" />
              <path d="M12 56c3-12 14-18 20-18s17 6 20 18" />
            </svg>
          </span>
          <span className="welcome-text">Welcome {displayName}</span>
        </Link>
        <button className="icon-button menu-button" type="button" aria-label="Menu">
          <span className="menu-lines"></span>
        </button>
      </div>
    </header>
  );
}
