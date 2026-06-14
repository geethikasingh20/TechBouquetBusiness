import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAddresses } from "../data/api";

const sections = [
  "My Profile",
  "My Addresses",
  "My Orders",
  "Favourite Moments",
  "Transactions",
  "Settings",
];

export default function ProfilePage() {
  const [active, setActive] = useState(sections[0]);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState("");
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!user?.token || active !== "My Addresses") {
        return;
      }

      setAddressesLoading(true);
      setAddressesError("");

      try {
        const data = await fetchAddresses(user.token);
        console.log(`inside data ${data}`);
        setAddresses(Array.isArray(data) ? data : []);
      } catch (error) {
        setAddresses([]);
        setAddressesError(error.message || "Failed to load saved addresses");
      } finally {
        setAddressesLoading(false);
      }
    };

    loadAddresses();
  }, [active, user?.token]);

  const isVerified = !!profile?.emailVerified;

  return (
    <div className="page profile-page">
      <aside className="profile-sidebar">
        {sections.map((section) => (
          <button
            key={section}
            className={active === section ? "active" : ""}
            onClick={() => setActive(section)}
          >
            {section}
          </button>
        ))}
      </aside>
      <section className="profile-content">
        <h2>{active}</h2>
        {active === "My Profile" && (
          <div className="profile-details">
            <p>
              <strong>Full Name:</strong> {profile?.name || ""}
            </p>
            <p>
              <strong>Email:</strong> {profile?.email || ""}
              <span
                className={isVerified ? "verified-badge" : "unverified-badge"}
              >
                {isVerified ? (
                  <>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Verified
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                    Not Verified
                  </>
                )}
              </span>
            </p>
            <p>
              <strong>Phone Number:</strong> {profile?.phoneNumber || ""}
            </p>
            <p>
              <strong>Zodiac Sign:</strong>{" "}
            </p>
            <p>
              <strong>Date of Birth:</strong>{" "}
            </p>
            <p>
              <strong>Gender:</strong>{" "}
            </p>
            <p>
              <strong>Primary Address:</strong>{" "}
            </p>
            <button className="ghost">Edit Details</button>
          </div>
        )}
        {active === "My Addresses" && (
          <div className="address-book">
            {addressesLoading && <p>Loading saved addresses...</p>}
            {!addressesLoading && addressesError && (
              <p className="field-error">{addressesError}</p>
            )}
            {!addressesLoading && !addressesError && addresses.length === 0 && (
              <div className="empty-state">
                <h3>No saved addresses yet</h3>
                <p>Saved addresses from checkout will appear here.</p>
              </div>
            )}
            {!addressesLoading && addresses.length > 0 && (
              <div className="address-grid">
                {addresses.map((address) => (
                  <article key={address.id} className="address-card">
                    <div className="address-card-head">
                      <strong>{address.label || "Saved Address"}</strong>
                      <span className="address-pincode">{address.pincode}</span>
                    </div>
                    <p className="address-recipient">{address.recipientName}</p>
                    <p>
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                      {address.line3 ? `, ${address.line3}` : ""}
                    </p>
                    {(address.city || address.state) && (
                      <p>
                        {address.city}
                        {address.city && address.state ? ", " : ""}
                        {address.state}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
        {active !== "My Profile" && active !== "My Addresses" && (
          <p>Content for {active} will appear here.</p>
        )}
      </section>
    </div>
  );
}
