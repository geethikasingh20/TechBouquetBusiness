import { useEffect, useState } from "react";
import Carousel from "../components/Carousel";
import Marquee from "../components/Marquee";
import ProductCard from "../components/ProductCard";
import { fetchProductsCached } from "../data/api";

const bouquetBestsellers = [
  "Sunrise Rose Bouquet",
  "Pastel Tulip Wrap",
  "Orchid Bloom Box",
  "Garden Fresh Mix"
];

const hamperBestsellers = [
  "Celebration Gift Hamper",
  "Festival Treat Box",
  "Love & Light Hamper",
  "Tea Time Basket"
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { items } = await fetchProductsCached();
        setProducts(items);
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

      <Marquee title="Bestsellers - Fresh Flower Bouquets" items={bouquetBestsellers} />
      <Marquee title="Bestsellers - Gift Hampers" items={hamperBestsellers} />

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
