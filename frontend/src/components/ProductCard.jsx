import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const MIN_LOADING_MS = 300;

  const handleAdd = async () => {
    setAdding(true);
    try {
      await Promise.all([
        addItem(product),
        new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS))
      ]);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <img src={product.images?.[0]?.url || product.images?.[0]} alt={product.name} />
      </Link>
      <h4>{product.name}</h4>
      <p>Rs. {product.price}</p>
      <button className="primary add-to-cart-btn" onClick={handleAdd} disabled={adding}>
        Add to Cart
        {adding && (
          <span className="btn-loading" aria-live="polite">
            <span className="spinner small" />
          </span>
        )}
      </button>
    </div>
  );
}
