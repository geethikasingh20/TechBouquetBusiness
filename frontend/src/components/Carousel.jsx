import { useEffect, useState } from "react";
import slide1 from "../assets/carousel1.png";
import slide2 from "../assets/carousel2.png";
import slide3 from "../assets/carousel3.jpg";

const slides = [slide1, slide2, slide3];

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
