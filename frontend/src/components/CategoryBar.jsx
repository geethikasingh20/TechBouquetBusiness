import { Link, useLocation, useNavigate } from "react-router-dom";

const subcategories = {
  Bouquets: ["Fresh Flowers", "Dry Flowers"],
  Plants: ["Flower Plants", "Decoration Plants"],
  "Gift Hampers": ["Gift Hampers"],
  Cakes: ["Cakes"]
};

export default function CategoryBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const goCategory = (category, sub) => {
    const base = `/category/${encodeURIComponent(category)}`;
    if (sub) {
      navigate(`${base}?sub=${encodeURIComponent(sub)}`);
      return;
    }
    navigate(base);
  };

  return (
    <section className="category-bar">
      {Object.keys(subcategories).map((category) => (
        <div key={category} className="category-item">
          <button
            type="button"
            className="category-link"
            onClick={() => goCategory(category)}
          >
            {category}
          </button>
          <div className="category-dropdown">
            {subcategories[category].map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => goCategory(category, sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
