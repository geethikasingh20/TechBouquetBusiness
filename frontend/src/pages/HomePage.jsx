import { useEffect, useState } from "react";
import Carousel from "../components/Carousel";
import Marquee from "../components/Marquee";
import ProductCard from "../components/ProductCard";
import { fetchProductSummariesCached } from "../data/api";


export default function HomePage() {
  const bestsellerCategories = ["Bouquets", "Plants", "Cakes", "Gift Hampers"];

const buildBestsellers = (items) => {
  const normalized = Array.isArray(items) ? items : [];
  const picks = [];
  bestsellerCategories.forEach((category) => {
    const matches = normalized.filter((product) =>
      (product.category || "").toLowerCase() === category.toLowerCase()
    );
    picks.push(...matches.slice(0, 2));
  });

  const remaining = normalized.filter((product) => !picks.some((p) => p.id === product.id));
  picks.push(...remaining.slice(0, 8 - picks.length));

  return picks.map((product) => ({
    id: product.id,
    name: product.name,
    image: product.images?.[0]?.url || product.images?.[0],
    link: `/product/${product.id}`
  }));
};

const [products, setProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { items } = await fetchProductSummariesCached();
        const normalized = (items || []).map((item) => ({
          ...item,
          images: item.imageUrl ? [{ url: item.imageUrl }] : []
        }));
        setProducts(normalized);
        setBestsellers(buildBestsellers(normalized));
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page">
      <Carousel />

      <Marquee title="Bestsellers" items={bestsellers} />

      <section className="featured">
        <h3>Featured Products</h3>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
