import { useEffect, useState } from "react";

const slides = [
  "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=1400&q=80"
];

export default function Carousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel">
      {slides.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt="Bouquet"
          className={idx === index ? "active" : ""}
        />
      ))}
    </div>
  );
}
