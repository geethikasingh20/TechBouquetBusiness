import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import avatarImage from "../assets/avtar-yellow.avif";
import logoImage from "../assets/logoImage.png";
import tokriImage from "../assets/tokri.png";

const BENGALURU_VIEWBOX = "77.38,12.83,77.84,13.14";

export default function Header() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const [location, setLocation] = useState({ city: "", state: "", pincode: "" });
  const [manualLocation, setManualLocation] = useState("");
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationError, setLocationError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  useEffect(() => {
    if (!editingLocation) return;
    if (!manualLocation || manualLocation.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const query = manualLocation.trim();
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&viewbox=${BENGALURU_VIEWBOX}&bounded=1&accept-language=en`
        );
        const results = await response.json();
        const filtered = (results || []).filter((item) => {
          const addr = item.address || {};
          const city = (addr.city || addr.town || addr.village || addr.county || "").toLowerCase();
          const display = (item.display_name || "").toLowerCase();
          return city.includes("bengaluru") || city.includes("bangalore") || display.includes("bengaluru") || display.includes("bangalore");
        });
        setLocationSuggestions(filtered);
      } catch {
        setLocationSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [manualLocation, editingLocation]);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      setLoggingOut(false);
    }, 800);
  };

  const applySuggestion = async (item) => {
    const address = item.address || {};
    const display = (item.display_name || "").toLowerCase();
    const cityRaw = address.city || address.town || address.village || address.county || address.suburb || address.neighbourhood || "";
    const city = cityRaw || (display.includes("bengaluru") || display.includes("bangalore") ? "Bengaluru" : "");
    const state = address.state || "";
    let pincode = address.postcode || "";

    const isBengaluru =
      city.toLowerCase().includes("bengaluru") ||
      city.toLowerCase().includes("bangalore") ||
      display.includes("bengaluru") ||
      display.includes("bangalore");

    if (!isBengaluru) {
      setLocationError("Please choose a Bengaluru location.");
      return;
    }

    if (!pincode && item.lat && item.lon) {
      try {
        const reverse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${item.lat}&lon=${item.lon}&zoom=18&addressdetails=1&accept-language=en`
        );
        const reverseData = await reverse.json();
        const revAddr = reverseData?.address || {};
        pincode = revAddr.postcode || "";
      } catch {
        pincode = "";
      }
    }

    setLocation({ city: city || "Bengaluru", state: state || "Karnataka", pincode });
    setManualLocation("");
    setLocationSuggestions([]);
    setLocationError("");
    setEditingLocation(false);
  };

  const handleManualSubmit = async (event) => {
    event.preventDefault();
    if (!manualLocation.trim()) return;
    if (locationSuggestions.length > 0) {
      await applySuggestion(locationSuggestions[0]);
      return;
    }
    setLocationError("Please select a Bengaluru location from suggestions.");
  };

  const openLocationModal = () => {
    setManualLocation("");
    setLocationSuggestions([]);
    setLocationError("");
    setEditingLocation(true);
  };

  const closeLocationModal = () => {
    setManualLocation("");
    setLocationSuggestions([]);
    setLocationError("");
    setEditingLocation(false);
  };

  const displayName = user?.name ? user.name : "Guest";
  const profileLink = user ? "/profile" : "/login";

  return (
    <header className="site-header">
      {editingLocation && <div className="location-overlay" onClick={closeLocationModal} />}
      {editingLocation && (
        <div className="location-modal">
          <h4>Set Delivery Location</h4>
          <form className="location-form" onSubmit={handleManualSubmit}>
            <input
              type="text"
              placeholder="Area or Pincode (Bengaluru)"
              value={manualLocation}
              onChange={(event) => {
                setManualLocation(event.target.value);
                setLocationError("");
              }}
            />
            {locationSuggestions.length > 0 && (
              <div className="location-suggestions">
                {locationSuggestions.map((item) => (
                  <button
                    key={item.place_id}
                    type="button"
                    onClick={() => applySuggestion(item)}
                  >
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}
            {locationError && <span className="field-error">{locationError}</span>}
            <div className="location-actions">
              <button type="submit">Update</button>
            </div>
          </form>
        </div>
      )}
      <div className="menu-wrapper">
        <button
          className="icon-button menu-button"
          type="button"
          aria-label="Menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="menu-lines"></span>
        </button>
        {menuOpen && (
          <div className="menu-dropdown" onMouseLeave={() => setMenuOpen(false)}>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
            <Link to="/policy" onClick={() => setMenuOpen(false)}>Policy</Link>
            <Link to="/help" onClick={() => setMenuOpen(false)}>Help</Link>
          </div>
        )}
      </div>
      <div className="header-left">
        <Link to="/" className="logo">
          <img src={logoImage} alt="TechBouquet" className="logo-image" />
        </Link>
        <div className="location-block">
          <span className="deliver">Deliver to {location.state || ""}</span>
          <span className="city">
            {location.city || ""}{location.pincode ? ` - ${location.pincode}` : ""}
            {!editingLocation && (
              <button className="location-edit" type="button" onClick={openLocationModal} title="Change location">
                <img src="/location.png" alt="Change location" className="location-icon" />
              </button>
            )}
          </span>
        </div>
      </div>
      <SearchBar />
      <div className="header-actions">
        {!user && !loggingOut && (
          <button className="primary" onClick={() => navigate("/register")}>Register</button>
        )}
        {user && (
          <button className="ghost" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        )}
        {loggingOut && !user && (
          <span className="logout-status">Logged out</span>
        )}
        <Link to={profileLink} className="icon-button profile-link">
          <span className="profile-avatar" aria-hidden="true">
            <img src={avatarImage} alt="User" />
          </span>
          <span className="welcome-text">Welcome {displayName}</span>
        </Link>
        <Link to="/cart" className="icon-button tokri-button" aria-label="Cart">
          <img src={tokriImage} alt="Tokri" className="tokri-icon" />
          <span className="tokri-count">{totalQuantity}</span>
        </Link>
      </div>
    </header>
  );
}
