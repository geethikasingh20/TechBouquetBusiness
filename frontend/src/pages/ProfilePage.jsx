import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const sections = [
  "My Profile",
  "My Addresses",
  "My Orders",
  "Favourite Moments",
  "Transactions",
  "Settings"
];

export default function ProfilePage() {
  const [active, setActive] = useState(sections[0]);
  const { profile } = useAuth();

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
            <p><strong>Full Name:</strong> {profile?.name || ""}</p>
            <p><strong>Email:</strong> {profile?.email || ""}</p>
            <p><strong>Phone Number:</strong> {profile?.phoneNumber || ""}</p>
            <p><strong>Zodiac Sign:</strong> </p>
            <p><strong>Date of Birth:</strong> </p>
            <p><strong>Gender:</strong> </p>
            <p><strong>Primary Address:</strong> </p>
            <button className="ghost">Edit Details</button>
          </div>
        )}
        {active !== "My Profile" && (
          <p>Content for {active} will appear here.</p>
        )}
      </section>
    </div>
  );
}
