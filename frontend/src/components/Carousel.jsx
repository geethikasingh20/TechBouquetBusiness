import { useEffect, useState } from "react";
import slide1 from "../assets/carousel1.png";
import slide2 from "../assets/carousel2.jpg";

const slides = [slide2,slide1];

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
          className={`${idx === index ? "active" : ""} slide-${idx}`}
        />
      ))}
      <div className="carousel-dots" aria-label="Carousel navigation">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={idx === index ? "dot active" : "dot"}
            onClick={() => setIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
