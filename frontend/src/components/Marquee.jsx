import { Link } from "react-router-dom";

export default function Marquee({ title, items }) {
  const list = Array.isArray(items) ? items : [];

  if (list.length === 0) {
    return null;
  }

  return (
    <section className="marquee-section">
      <h3>{title}</h3>
      <div className="marquee">
        <div className="marquee-track">
          {list.concat(list).map((item, idx) => (
            <Link key={`${item.id || item.name}-${idx}`} to={item.link || "#"} className="marquee-card">
              <img src={item.image} alt={item.name} />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
