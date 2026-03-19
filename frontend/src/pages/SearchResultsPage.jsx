import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { searchProducts } from "../data/api";

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const [results, setResults] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await searchProducts(query);
        setResults(data);
      } catch (error) {
        setResults([]);
      }
    };
    if (query) {
      load();
    }
  }, [query]);

  return (
    <div className="page">
      <h2>Search Results for "{query}"</h2>
      {results.length === 0 ? (
        <p>No matching products found.</p>
      ) : (
        <div className="grid">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
