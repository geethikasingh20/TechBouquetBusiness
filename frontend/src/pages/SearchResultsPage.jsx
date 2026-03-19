import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  const results = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

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
