import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  deleteAddress,
  fetchAddresses,
  fetchOrders,
  openOrderReceiptInNewTab,
  updateAddress,
} from "../data/api";

const sections = [
  "My Profile",
  "My Addresses",
  "My Orders",
  "Favourite Moments",
  "Transactions",
  "Settings",
];

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M7 7l1 13h8l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12l4 4L19 6" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function ProfilePage() {
  const [active, setActive] = useState(sections[0]);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState("");
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [addressActionMessage, setAddressActionMessage] = useState("");
  const [addressActionError, setAddressActionError] = useState("");
  const [busyAddressId, setBusyAddressId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [receiptActionError, setReceiptActionError] = useState("");
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

  useEffect(() => {
    setEditingAddressId(null);
    setEditingLabel("");
    setAddressActionMessage("");
    setAddressActionError("");
    setReceiptActionError("");
  }, [active]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.token || active !== "My Orders") {
        return;
      }

      setOrdersLoading(true);
      setOrdersError("");

      try {
        const data = await fetchOrders(user.token);
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        setOrders([]);
        setOrdersError(error.message || "Failed to load orders");
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [active, user?.token]);

  const startEditAddress = (address) => {
    setEditingAddressId(address.id);
    setEditingLabel(address.label || "");
    setAddressActionMessage("");
    setAddressActionError("");
  };

  const cancelEditAddress = () => {
    setEditingAddressId(null);
    setEditingLabel("");
  };

  const saveEditedAddress = async (address) => {
    if (!user?.token) return;
    const nextLabel = editingLabel.trim();
    if (!nextLabel) {
      setAddressActionError("Address label is required");
      return;
    }

    setBusyAddressId(address.id);
    setAddressActionError("");
    setAddressActionMessage("");

    try {
      const updated = await updateAddress(
        address.id,
        {
          label: nextLabel,
          recipientName: address.recipientName,
          recipientPhone: address.recipientPhone,
          line1: address.line1,
          line2: address.line2,
          line3: address.line3,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        user.token,
      );

      setAddresses((prev) =>
        prev.map((item) => (item.id === address.id ? updated : item)),
      );

      setAddressActionMessage("Address label updated.");
      cancelEditAddress();
    } catch (error) {
      setAddressActionError(error.message || "Failed to update address");
    } finally {
      setBusyAddressId(null);
    }
  };

  const removeAddress = async (addressId) => {
    if (!user?.token) return;
    setBusyAddressId(addressId);
    setAddressActionError("");
    setAddressActionMessage("");

    try {
      await deleteAddress(addressId, user.token);
      setAddresses((prev) => prev.filter((address) => address.id !== addressId));
      setAddressActionMessage("Address deleted.");
      if (editingAddressId === addressId) {
        cancelEditAddress();
      }
    } catch (error) {
      setAddressActionError(error.message || "Failed to delete address");
    } finally {
      setBusyAddressId(null);
    }
  };

  const requestDeleteAddress = (address) => {
    setDeleteTarget(address);
    setAddressActionError("");
    setAddressActionMessage("");
  };

  const cancelDeleteAddress = () => {
    setDeleteTarget(null);
  };

  const confirmDeleteAddress = async () => {
    if (!deleteTarget) return;
    const addressId = deleteTarget.id;
    setDeleteTarget(null);
    await removeAddress(addressId);
  };

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
            {!addressesLoading && addressActionError && (
              <p className="field-error">{addressActionError}</p>
            )}
            {!addressesLoading && addressActionMessage && (
              <p className="field-success">{addressActionMessage}</p>
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
                    {editingAddressId === address.id ? (
                      <div className="address-edit-form">
                        <label>
                          Label
                          <input
                            type="text"
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            placeholder="Home, Office, Mom..."
                          />
                        </label>
                        <div className="address-edit-actions">
                          <button
                            type="button"
                            className="icon-action icon-save"
                            title="Save label"
                            aria-label="Save label"
                            disabled={busyAddressId === address.id}
                            onClick={() => saveEditedAddress(address)}
                          >
                            <SaveIcon />
                          </button>
                          <button
                            type="button"
                            className="icon-action icon-cancel"
                            title="Cancel edit"
                            aria-label="Cancel edit"
                            disabled={busyAddressId === address.id}
                            onClick={cancelEditAddress}
                          >
                            <CancelIcon />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="address-recipient">
                          {address.recipientName}
                        </p>
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
                      </>
                    )}
                    <div className="address-card-actions">
                      <button
                        type="button"
                        className="icon-action icon-edit"
                        title="Edit label"
                        aria-label="Edit label"
                        disabled={busyAddressId === address.id}
                        onClick={() => startEditAddress(address)}
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-action icon-delete"
                        title="Delete address"
                        aria-label="Delete address"
                        disabled={busyAddressId === address.id}
                        onClick={() => requestDeleteAddress(address)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
        {active === "My Orders" && (
          <div className="order-history">
            {ordersLoading && <p>Loading your orders...</p>}
            {!ordersLoading && ordersError && (
              <p className="field-error">{ordersError}</p>
            )}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="empty-state">
                <h3>No orders yet</h3>
                <p>Your placed orders will appear here.</p>
              </div>
            )}
            {!ordersLoading &&
              orders.length > 0 &&
              orders.map((order) => {
                const itemsByPincode = order.items.reduce((groups, item) => {
                  const key = item.deliveryPincode || "No delivery pincode";
                  if (!groups[key]) {
                    groups[key] = [];
                  }
                  groups[key].push(item);
                  return groups;
                }, {});

                return (
                  <article key={order.orderNumber} className="order-card">
                    <div className="order-card-head">
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <p>Placed on {new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="order-card-meta">
                        <span className={`order-status order-status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                        <strong>Rs. {order.totalAmount}</strong>
                      </div>
                    </div>
                    {order.receiptUrl && (
                      <p>
                        <button
                          type="button"
                          className="text-link-button"
                          onClick={async () => {
                            setReceiptActionError("");
                            try {
                              await openOrderReceiptInNewTab(
                                user.token,
                                order.orderNumber,
                              );
                            } catch (error) {
                              setReceiptActionError(
                                error.message || "Failed to open receipt",
                              );
                            }
                          }}
                        >
                          View receipt
                        </button>
                      </p>
                    )}
                    {receiptActionError && (
                      <p className="field-error">{receiptActionError}</p>
                    )}
                    <div className="order-groups">
                      {Object.entries(itemsByPincode).map(([pincode, items]) => (
                        <div key={pincode} className="order-group">
                          <div className="order-group-head">
                            <strong>{`Deliver to ${pincode}`}</strong>
                          </div>
                          {items.map((item) => (
                            <div key={item.id} className="order-item-row">
                              <div className="order-item-main">
                                <span>{item.productName}</span>
                                <small>Qty: {item.quantity}</small>
                              </div>
                              <div className="order-item-pricing">
                                <span>Rs. {item.lineTotal}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
          </div>
        )}
        {active !== "My Profile" &&
          active !== "My Addresses" &&
          active !== "My Orders" && <p>Content for {active} will appear here.</p>}
      </section>
      {deleteTarget && (
        <div className="dialog-overlay" role="presentation">
          <div
            className="dialog-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-address-title"
          >
            <h3 id="delete-address-title">Delete address?</h3>
            <p>
              This will permanently remove the address label{" "}
              <strong>{deleteTarget.label || "Saved Address"}</strong>.
            </p>
            <div className="dialog-actions">
              <button
                type="button"
                className="ghost"
                onClick={cancelDeleteAddress}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                onClick={confirmDeleteAddress}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
