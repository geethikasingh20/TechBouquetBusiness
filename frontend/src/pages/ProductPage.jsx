import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { addons, products } from "../data/products";
import { useCart } from "../context/CartContext";

export default function ProductPage() {
  const { id } = useParams();
  const product = useMemo(() => products.find((p) => String(p.id) === id), [id]);
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(product?.images[0]);
  const [pincode, setPincode] = useState("");
  const [selectedAddons, setSelectedAddons] = useState([]);

  if (!product) {
    return <div className="page">Product not found.</div>;
  }

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.find((item) => item.id === addon.id)
        ? prev.filter((item) => item.id !== addon.id)
        : [...prev, addon]
    );
  };

  return (
    <div className="page product-page">
      <div className="product-gallery">
        <img src={selectedImage} alt={product.name} className="main-image" />
        <div className="thumbnail-row">
          {product.images.map((img) => (
            <button key={img} type="button" onClick={() => setSelectedImage(img)}>
              <img src={img} alt={product.name} />
            </button>
          ))}
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

        <button className="primary" onClick={() => addItem(product, selectedAddons)}>
          Add to Cart
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
