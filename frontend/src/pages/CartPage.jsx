import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, loading } = useCart();
  const [localQty, setLocalQty] = useState({});
  const [pending, setPending] = useState({});
  const timersRef = useRef({});

  useEffect(() => {
    const next = {};
    items.forEach((item) => {
      next[item.id] = item.quantity;
    });
    setLocalQty(next);
  }, [items]);

  const scheduleUpdate = (id, value) => {
    const safeValue = Math.max(1, Number(value || 1));
    setLocalQty((prev) => ({ ...prev, [id]: safeValue }));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
    }
    timersRef.current[id] = setTimeout(async () => {
      setPending((prev) => ({ ...prev, [id]: true }));
      await updateQuantity(id, safeValue);
      setPending((prev) => ({ ...prev, [id]: false }));
      delete timersRef.current[id];
    }, 400);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="page cart-page">
      <h2>Your Cart</h2>
      {loading && items.length === 0 ? (
        <p>Loading your cart...</p>
      ) : items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <h4>{item.name}</h4>
                <p>Rs. {item.price}</p>
                {item.addons?.length > 0 && (
                  <p className="addons-line">
                    Add-ons: {item.addons.map((addon) => addon.name).join(", ")}
                  </p>
                )}
              </div>
              <div className="cart-actions">
                <div className="qty-control">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => scheduleUpdate(item.id, (localQty[item.id] || item.quantity) - 1)}
                    disabled={pending[item.id]}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={localQty[item.id] ?? item.quantity}
                    onChange={(event) => scheduleUpdate(item.id, event.target.value)}
                    disabled={pending[item.id]}
                  />
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => scheduleUpdate(item.id, (localQty[item.id] || item.quantity) + 1)}
                    disabled={pending[item.id]}
                  >
                    +
                  </button>
                  {pending[item.id] && <span className="spinner small" />}
                </div>
                <p>Total: Rs. {item.price * item.quantity}</p>
                <button className="ghost" onClick={() => removeItem(item.id)} disabled={pending[item.id]}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="cart-summary">
            <strong>Grand Total: Rs. {total}</strong>
            <button className="ghost" onClick={clearCart}>Clear Cart</button>
          </div>
        </div>
      )}
    </div>
  );
}
