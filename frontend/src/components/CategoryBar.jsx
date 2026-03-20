export default function CategoryBar() {
  return (
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
  );
}
