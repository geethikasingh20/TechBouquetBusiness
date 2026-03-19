import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <img src={product.images[0]} alt={product.name} />
      </Link>
      <h4>{product.name}</h4>
      <p>Rs. {product.price}</p>
      <button className="primary" onClick={() => addItem(product)}>
        Add to Cart
      </button>
    </div>
  );
}
