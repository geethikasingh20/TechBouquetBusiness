import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../data/api";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        setProducts([]);
      }
    };
    load();
  }, []);

  const suggestions = useMemo(() => {
    if (query.trim().length < 3) return [];
    const lower = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(lower)).slice(0, 6);
  }, [query, products]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="search-wrapper">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search bouquets, plants, gifts..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => navigate(`/product/${item.id}`)}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
