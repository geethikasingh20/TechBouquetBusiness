import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProductById } from "../data/api";
import { addons } from "../data/products";
import bangalorePincodes from "../data/IN_deliveryCodes.json";
import { useCart } from "../context/CartContext";

export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("idle");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const MIN_LOADING_MS = 300;
  const pincodeInputRef = useRef(null);

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
        : [...prev, addon],
    );
  };

  const handlePincodeChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(digitsOnly);

    if (!digitsOnly) {
      setDeliveryStatus("idle");
      setDeliveryMessage("");
      return;
    }

    if (digitsOnly.length < 6) {
      setDeliveryStatus("idle");
      setDeliveryMessage("");
      return;
    }

    if (bangalorePincodes.includes(digitsOnly)) {
      setDeliveryStatus("available");
      setDeliveryMessage(`Delivery available for ${digitsOnly} in Bengaluru.`);
      return;
    }

    setDeliveryStatus("unavailable");
    setDeliveryMessage("We deliver only to Bengaluru pincodes in our service zone.");
  };

  const handlePincodeSelect = (selectedCode) => {
    setPincode(selectedCode);
    setDeliveryStatus("available");
    setDeliveryMessage(`Delivery available for ${selectedCode} in Bengaluru.`);
  };

  const handleDeliveryCheck = (event) => {
    event.preventDefault();

    if (!bangalorePincodes.includes(pincode)) {
      setDeliveryStatus("unavailable");
      setDeliveryMessage(
        "We deliver only to Bengaluru pincodes in our service zone.",
      );
      return;
    }

    setDeliveryStatus("available");
    setDeliveryMessage(`Delivery available for ${pincode} in Bengaluru.`);
  };

  const handleAdd = async () => {
    if (deliveryStatus !== "available") {
      setDeliveryMessage("Enter a valid Bengaluru pincode before adding to cart.");
      setDeliveryStatus("unavailable");
      pincodeInputRef.current?.focus();
      return;
    }

    setAdding(true);
    try {
      await Promise.all([
        addItem(product, selectedAddons, pincode),
        new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS)),
      ]);
    } finally {
      setAdding(false);
    }
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
  const deliverySuggestions =
    pincode.length > 0 && pincode.length < 6
      ? bangalorePincodes.filter((code) => code.startsWith(pincode))
      : [];
  const deliveryPrefixMismatch =
    pincode.length > 0 && pincode.length < 6 && !pincode.startsWith("560");

  return (
    <div className="page">
      <nav className="breadcrumbs">
        <Link to="/">Home</Link>
        {categoryName && (
          <>
            <span>/</span>
            <Link to={`/category/${encodeURIComponent(categoryName)}`}>
              {categoryName}
            </Link>
          </>
        )}
        {subcategoryName && (
          <>
            <span>/</span>
            <Link
              to={`/category/${encodeURIComponent(categoryName)}?sub=${encodeURIComponent(subcategoryName)}`}
            >
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
                <button
                  key={url}
                  type="button"
                  onClick={() => setSelectedImage(url)}
                >
                  <img src={url} alt={product.name} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="product-info">
          <h2>{product.name}</h2>
          <div
            className="flower-rating"
            aria-label={`Rating ${ratingValue} out of 5`}
          >
            {Array.from({ length: ratingRounded }).map((_, idx) => (
              <img
                key={idx}
                src="/rating.png"
                alt="Rating"
                className="rating-icon"
              />
            ))}
            <span className="rating-text">{ratingValue}</span>
          </div>
          <p className="price">Rs. {product.price}</p>

          <form className="delivery-check" onSubmit={handleDeliveryCheck}>
            <label htmlFor="delivery-pincode" className="delivery-label">
              Delivery Pincode
            </label>
            <div className="delivery-input-row">
              <div className="delivery-input-wrap">
                <input
                  ref={pincodeInputRef}
                  id="delivery-pincode"
                  type="text"
                  value={pincode}
                  onChange={handlePincodeChange}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="off"
                  placeholder="Enter Bengaluru pincode"
                  aria-autocomplete="list"
                  aria-expanded={deliverySuggestions.length > 0}
                  aria-controls="delivery-pincode-suggestions"
                  aria-describedby="delivery-pincode-hint delivery-pincode-message"
                />
                {deliverySuggestions.length > 0 && (
                  <div
                    id="delivery-pincode-suggestions"
                    className="delivery-suggestions"
                    role="listbox"
                    aria-label="Bengaluru pincode suggestions"
                  >
                    {deliverySuggestions.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handlePincodeSelect(code)}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="ghost">
                Check
              </button>
            </div>
            <span id="delivery-pincode-hint" className="field-hint">
              Bengaluru pincodes start with 560 and must be 6 digits long.
            </span>
            {deliveryPrefixMismatch ? (
              <span className="field-error">Bengaluru pincodes start with 560.</span>
            ) : pincode.length > 0 &&
              pincode.length < 6 &&
              deliverySuggestions.length === 0 ? (
              <span className="field-error">No Bengaluru pincode matches this prefix.</span>
            ) : null}
            {deliveryMessage && (
              <span
                id="delivery-pincode-message"
                className={
                  deliveryStatus === "available"
                    ? "delivery-success"
                    : "field-error"
                }
              >
                {deliveryMessage}
              </span>
            )}
          </form>

          <button
            className="primary add-to-cart-btn"
            onClick={handleAdd}
            disabled={adding}
          >
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
                  checked={
                    !!selectedAddons.find((item) => item.id === addon.id)
                  }
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
