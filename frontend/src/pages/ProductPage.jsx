import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../data/api";
import { addons } from "../data/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedAddons, setSelectedAddons] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
        const firstImage = data.images?.[0]?.url || data.images?.[0];
        setSelectedImage(firstImage || "");
      } catch (error) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.find((item) => item.id === addon.id)
        ? prev.filter((item) => item.id !== addon.id)
        : [...prev, addon]
    );
  };

  const handleAdd = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAdding(true);
    await addItem(product, selectedAddons);
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-spinner">
          <div className="brand-spinner">
            <span className="spinner-petal" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="page">Product not found.</div>;
  }

  const categoryName = product.category || "";
  const subcategoryName = product.subcategory || "";
  const ratingValue = Number(product.rating || 5).toFixed(1);
  const ratingRounded = Math.round(Number(product.rating || 5));

  return (
    <div className="page">
      <nav className="breadcrumbs">
        <Link to="/">Home</Link>
        {categoryName && (
          <>
            <span>/</span>
            <Link to={`/category/${encodeURIComponent(categoryName)}`}>{categoryName}</Link>
          </>
        )}
        {subcategoryName && (
          <>
            <span>/</span>
            <Link to={`/category/${encodeURIComponent(categoryName)}?sub=${encodeURIComponent(subcategoryName)}`}>
              {subcategoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-page">
        <div className="product-gallery">
          <img src={selectedImage} alt={product.name} className="main-image" />
          <div className="thumbnail-row">
            {(product.images || []).map((img) => {
              const url = img.url || img;
              return (
                <button key={url} type="button" onClick={() => setSelectedImage(url)}>
                  <img src={url} alt={product.name} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="product-info">
          <h2>{product.name}</h2>
          <div className="flower-rating" aria-label={`Rating ${ratingValue} out of 5`}>
            {Array.from({ length: ratingRounded }).map((_, idx) => (
              <img key={idx} src="/rating.png" alt="Rating" className="rating-icon" />
            ))}
            <span className="rating-text">{ratingValue}</span>
          </div>
          <p className="price">Rs. {product.price}</p>

          {/*TODO:
          <label>
            Delivery Pincode
            <input value={pincode} onChange={(event) => setPincode(event.target.value)} />
          </label>
          {pincode && (
            <div className="delivery-options">
              <button className="ghost">Tomorrow</button>
              <button className="ghost">Later</button>
            </div>
          )}
          */}
          <button className="primary add-to-cart-btn" onClick={handleAdd} disabled={adding}>
            Add to Cart
            {adding && (
              <span className="btn-loading" aria-live="polite">
                <span className="spinner small" />
              </span>
            )}
          </button>

          <div className="addons">
            <h4>Add-ons</h4>
            {addons.map((addon) => (
              <label key={addon.id} className="addon-item">
                <input
                  type="checkbox"
                  checked={!!selectedAddons.find((item) => item.id === addon.id)}
                  onChange={() => toggleAddon(addon)}
                />
                {addon.name} - Rs. {addon.price}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
