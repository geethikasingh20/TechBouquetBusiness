import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
    const numeric = Number(value || 0);
    const safeValue = Number.isFinite(numeric) ? numeric : 0;

    setLocalQty((prev) => ({ ...prev, [id]: safeValue }));

    if (safeValue <= 0) {
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
      }
      setPending((prev) => ({ ...prev, [id]: true }));
      removeItem(id).finally(() => {
        setPending((prev) => ({ ...prev, [id]: false }));
      });
      return;
    }

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
        <div className="page-spinner">
          <span className="spinner" />
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
          {items.map((item) => (
            <div key={item.id} className="cart-row">
              <div className="cart-col">
                <Link to={`/product/${item.productId}`} className="cart-link" target="_blank" rel="noreferrer">
                  <img className="cart-thumb" src={item.imageUrl} alt={item.name} />
                </Link>
              </div>
              <div className="cart-col item-col">
                <Link className="cart-link" to={`/product/${item.productId}`} target="_blank" rel="noreferrer">
                  {item.name}
                </Link>
                {item.addons?.length > 0 && (
                  <p className="addons-line">
                    Add-ons: {item.addons.map((addon) => addon.name).join(", ")}
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
                      onClick={() => scheduleUpdate(item.id, (localQty[item.id] || item.quantity) - 1)}
                      disabled={pending[item.id]}
                    >
                      -
                    </button>
                  )}
                  <input
                    type="number"
                    min="0"
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
              </div>
              <div className="cart-col">Rs. {item.price * item.quantity}</div>
              <div className="cart-col"></div>
            </div>
          ))}
          <div className="cart-summary">
            <button className="ghost" onClick={clearCart}>Clear Cart</button>
            <strong>Order Total: Rs. {total}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
