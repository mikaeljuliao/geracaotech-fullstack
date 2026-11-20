import { useState } from 'react';
import './styles.css';

function dimension(value) {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  return value;
}

export default function Gallery({
  images = [],
  className = '',
  width,
  height,
  radius = '0px',
  showThumbs = false,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const goToPrevious = () => setActiveIndex((index) => Math.max(0, index - 1));
  const goToNext = () => setActiveIndex((index) => Math.min(images.length - 1, index + 1));
  const galleryStyle = {
    width: dimension(width) || '100%',
    '--gallery-radius': radius,
  };
  const viewportStyle = height ? { height: dimension(height) } : undefined;

  return (
    <div
      className={`gallery ${className}`.trim()}
      style={galleryStyle}
      role="region"
      aria-label="Galeria de imagens"
      aria-roledescription="carrossel"
    >
      <div className="gallery__viewport" style={viewportStyle}>
        <div
          className="gallery__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div className="gallery__slide" key={`${image.src}-${index}`}>
              <img src={image.src} alt={image.alt || `Imagem ${index + 1}`} />
            </div>
          ))}
        </div>
        <button
          className="gallery__arrow gallery__arrow--previous"
          type="button"
          onClick={goToPrevious}
          disabled={activeIndex === 0}
          aria-label="Imagem anterior"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          className="gallery__arrow gallery__arrow--next"
          type="button"
          onClick={goToNext}
          disabled={activeIndex === images.length - 1}
          aria-label="Proxima imagem"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {showThumbs && (
        <div className="gallery__thumbnails" aria-label="Miniaturas">
          {images.map((image, index) => (
            <button
              className={`gallery__thumbnail${index === activeIndex ? ' gallery__thumbnail--active' : ''}`}
              key={`${image.src}-thumbnail-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Exibir imagem ${index + 1}`}
              aria-pressed={index === activeIndex}
            >
              <img src={image.src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
