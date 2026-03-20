import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAdding(true);
    await addItem(product);
    setAdding(false);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <img src={product.images?.[0]?.url || product.images?.[0]} alt={product.name} />
      </Link>
      <h4>{product.name}</h4>
      <p>Rs. {product.price}</p>
      <button className="primary" onClick={handleAdd} disabled={adding}>
        {adding ? (
          <span className="btn-loading">
            <span className="spinner" /> Adding...
          </span>
        ) : (
          "Add to Cart"
        )}
      </button>
    </div>
  );
}
