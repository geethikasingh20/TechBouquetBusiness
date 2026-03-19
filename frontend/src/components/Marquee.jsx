export default function Marquee({ title, items }) {
  return (
    <section className="marquee-section">
      <h3>{title}</h3>
      <div className="marquee">
        <div className="marquee-track">
          {items.concat(items).map((item, idx) => (
            <span key={`${item}-${idx}`}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
