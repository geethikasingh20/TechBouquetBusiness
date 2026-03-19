import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="page cart-page">
      <h2>Your Cart</h2>
      {items.length === 0 ? (
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
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                />
                <p>Total: Rs. {item.price * item.quantity}</p>
                <button className="ghost" onClick={() => removeItem(item.id)}>Remove</button>
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
