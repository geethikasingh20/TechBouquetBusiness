import Carousel from "../components/Carousel";
import Marquee from "../components/Marquee";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

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
  return (
    <div className="page">
      <section className="category-bar">
        <div className="category-item">
          Bouquets
          <div className="category-dropdown">
            <span>Fresh Flowers</span>
            <span>Dry Flowers</span>
          </div>
        </div>
        <div className="category-item">
          Plants
          <div className="category-dropdown">
            <span>Flower Plants</span>
            <span>Decoration Plants</span>
          </div>
        </div>
        <div className="category-item">Gift Hampers</div>
        <div className="category-item">Decoration Services</div>
      </section>

      <Carousel />

      <Marquee title="Bestsellers - Fresh Flower Bouquets" items={bouquetBestsellers} />
      <Marquee title="Bestsellers - Gift Hampers" items={hamperBestsellers} />

      <section className="featured">
        <h3>Featured Products</h3>
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
