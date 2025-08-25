import { useState, useEffect } from "react";
import "./ImageSlider.css"; // Make sure to create this CSS file

const images = ["1.png", "2.png", "3.png", "4.png", "5.png"];

const ImageSlider = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="slider-container">
      {images.map((image, index) => (
        <img key={index} src={image} alt={`Slider image ${index + 1}`} className={`slider-image ${index === currentImageIndex ? "active" : ""}`} />
      ))}
    </div>
  );
};

export default ImageSlider;
