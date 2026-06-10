import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, loading } = useCart();
  const [localQty, setLocalQty] = useState({});
  const [pending, setPending] = useState({});
  const timersRef = useRef({});
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const next = {};
    items.forEach((item) => {
      next[item.id] = item.quantity;
    });
    setLocalQty(next);
  }, [items]);

  const getAddonUnitTotal = (item) =>
    (item.addons || []).reduce(
      (sum, addon) => sum + Number(addon?.price || 0),
      0,
    );

  const getLineTotal = (item) => {
    const addonUnitTotal = getAddonUnitTotal(item);
    return (
      (Number(item.price || 0) + addonUnitTotal) * Number(item.quantity || 0)
    );
  };

  const scheduleUpdate = (id, value) => {
    const numeric = Number(value || 0);
    const safeValue = Number.isFinite(numeric) ? numeric : 0;

    setLocalQty((prev) => ({ ...prev, [id]: safeValue }));
    setPending((prev) => ({ ...prev, [id]: true }));

    if (safeValue <= 0) {
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
      }
      removeItem(id).finally(() => {
        setPending((prev) => ({ ...prev, [id]: false }));
      });
      return;
    }

    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
    }
    timersRef.current[id] = setTimeout(async () => {
      const start = Date.now();
      await updateQuantity(id, safeValue);
      const elapsed = Date.now() - start;
      const waitMs = Math.max(0, 250 - elapsed);
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
      setPending((prev) => ({ ...prev, [id]: false }));
      delete timersRef.current[id];
    }, 400);
  };

  const total = items.reduce((sum, item) => sum + getLineTotal(item), 0);
  const groupedItems = items.reduce((groups, item) => {
    const key = item.deliveryPincode?.trim() || "No delivery pincode";
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
    return groups;
  }, new Map());

  const checkoutLink = user ? "/checkout" : "/login";

  return (
    <div className="page cart-page">
      <h2>Your Cart</h2>
      {loading && items.length === 0 ? (
        <div className="page-spinner">
          <div className="brand-spinner">
            <span className="spinner-petal" />
          </div>
        </div>
      ) : items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          <div className="cart-header">
            <span>Image</span>
            <span>Item</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>
          {Array.from(groupedItems.entries()).map(
            ([deliveryPincode, groupedCartItems]) => (
              <section key={deliveryPincode} className="cart-group">
                <div className="cart-group-header">
                  <span className="cart-group-label">Group</span>
                  <span
                    className="cart-group-delivery"
                    title="Delivery pincode"
                  >
                    Deliver to {deliveryPincode}
                  </span>
                </div>
                <div className="cart-group-items">
                  {groupedCartItems.map((item) => (
                    <div key={item.id} className="cart-row">
                      <div className="cart-col">
                        <Link
                          to={`/product/${item.productId}`}
                          className="cart-link"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            className="cart-thumb"
                            src={item.imageUrl || "/logoImage.png"}
                            alt={item.name}
                          />
                        </Link>
                      </div>
                      <div className="cart-col item-col">
                        <Link
                          className="cart-link"
                          to={`/product/${item.productId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.name}
                        </Link>
                        {item.addons?.length > 0 && (
                          <p className="addons-line">
                            Add-ons:{" "}
                            {item.addons
                              .map(
                                (addon) => `${addon.name} (Rs. ${addon.price})`,
                              )
                              .join(", ")}
                          </p>
                        )}
                        {item.addons?.length > 0 && (
                          <p className="addons-line">
                            Add-on subtotal: Rs.{" "}
                            {getAddonUnitTotal(item) *
                              Number(item.quantity || 0)}
                          </p>
                        )}
                      </div>
                      <div className="cart-col">Rs. {item.price}</div>
                      <div className="cart-col qty-col">
                        <div className="qty-control">
                          {(localQty[item.id] ?? item.quantity) > 0 && (
                            <button
                              type="button"
                              className="ghost"
                              onClick={() =>
                                scheduleUpdate(
                                  item.id,
                                  (localQty[item.id] || item.quantity) - 1,
                                )
                              }
                              disabled={pending[item.id]}
                            >
                              -
                            </button>
                          )}
                          <input
                            type="number"
                            min="0"
                            value={localQty[item.id] ?? item.quantity}
                            onChange={(event) =>
                              scheduleUpdate(item.id, event.target.value)
                            }
                            disabled={pending[item.id]}
                          />
                          <button
                            type="button"
                            className="ghost"
                            onClick={() =>
                              scheduleUpdate(
                                item.id,
                                (localQty[item.id] || item.quantity) + 1,
                              )
                            }
                            disabled={pending[item.id]}
                          >
                            +
                          </button>
                          {pending[item.id] && (
                            <span className="spinner small" />
                          )}
                        </div>
                      </div>
                      <div className="cart-col">Rs. {getLineTotal(item)}</div>
                      <div className="cart-col"></div>
                    </div>
                  ))}
                </div>
              </section>
            ),
          )}
          <div className="cart-summary">
            <button className="ghost" onClick={clearCart}>
              Clear Cart
            </button>
            <strong>Order Total: Rs. {total}</strong>
            <button className="primary" onClick={() => navigate(checkoutLink)}>
              Checkout
            </button>
            <Link to="/checkout">
              <button className="primary">Checkout</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
