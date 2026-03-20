import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchProductsCached } from "../data/api";

const subcategoryMap = {
  Bouquets: ["Fresh Flowers", "Dry Flowers"],
  Plants: ["Flower Plants", "Decoration Plants"],
  "Gift Hampers": ["Gift Hampers"],
  Cakes: ["Cakes"]
};

export default function CategoryPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryName = decodeURIComponent(category || "");
  const sub = searchParams.get("sub") || "";

  useEffect(() => {
    const load = async () => {
      try {
        const { items } = await fetchProductsCached();
        setProducts(items);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const byCategory = products.filter((p) => (p.category || "").toLowerCase() === categoryName.toLowerCase());
    if (!sub) return byCategory;
    return byCategory.filter((p) => (p.subcategory || "").toLowerCase() === sub.toLowerCase());
  }, [products, categoryName, sub]);

  const subs = subcategoryMap[categoryName] || [];

  return (
    <div className="page category-page">
      <nav className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/category/${encodeURIComponent(categoryName)}`}>{categoryName}</Link>
        {sub && (
          <>
            <span>/</span>
            <Link to={`/category/${encodeURIComponent(categoryName)}?sub=${encodeURIComponent(sub)}`}>{sub}</Link>
          </>
        )}
      </nav>

      <header className="page-hero">
        <h2 className="page-title">{categoryName}</h2>
        <p className="page-subtitle">Explore curated {categoryName.toLowerCase()} for every occasion.</p>
      </header>

      {subs.length > 0 && (
        <div className="subcategory-bar">
          <button
            type="button"
            className={!sub ? "sub-pill active" : "sub-pill"}
            onClick={() => setSearchParams({})}
          >
            All
          </button>
          {subs.map((name) => (
            <button
              key={name}
              type="button"
              className={sub === name ? "sub-pill active" : "sub-pill"}
              onClick={() => setSearchParams({ sub: name })}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid">
          {filtered.length === 0 ? (
            <p>No products found.</p>
          ) : (
            filtered.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </div>
      )}
    </div>
  );
}
