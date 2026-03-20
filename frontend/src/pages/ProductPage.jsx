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
    return <div className="page">Loading product...</div>;
  }

  if (!product) {
    return <div className="page">Product not found.</div>;
  }

  const categoryName = product.category || "";
  const subcategoryName = product.subcategory || "";

  return (
    <div className="page product-page">
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
        <p className="reviews">Flower Reviews: ????????</p>
        <p className="price">Rs. {product.price}</p>

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

        <button className="primary" onClick={handleAdd} disabled={adding}>
          {adding ? (
            <span className="btn-loading">
              <span className="spinner" /> Adding...
            </span>
          ) : (
            "Add to Cart"
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
  );
}
