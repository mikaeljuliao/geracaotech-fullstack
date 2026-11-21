import { useState } from 'react';

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
  showArrows = true,
  showIndicators = false,
  renderSlide,
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
      className={`gallery flex max-w-full overflow-hidden flex-col gap-4 ${className}`.trim()}
      style={galleryStyle}
      role="region"
      aria-label="Galeria de imagens"
      aria-roledescription="carrossel"
    >
      <div
        className="gallery__viewport relative min-h-[180px] shrink-0 overflow-hidden"
        style={{ ...viewportStyle, borderRadius: radius }}
      >
        <div
          className="gallery__track flex w-full h-full transition-transform duration-350 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div
              className="gallery__slide relative w-full h-full shrink-0 basis-full"
              key={`${image.src}-${index}`}
            >
              {renderSlide ? (
                renderSlide(image, index)
              ) : (
                <img
                  className="block w-full h-full object-cover"
                  style={{ borderRadius: radius }}
                  src={image.src}
                  alt={image.alt || `Imagem ${index + 1}`}
                  onError={(e) => {
                    e.currentTarget.src = '/featured-k-swiss.png';
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {showArrows && (
          <>
            <button
              className="gallery__arrow gallery__arrow--previous absolute top-1/2 left-4 -translate-y-1/2 grid w-11 h-11 place-items-center p-2 border-0 rounded-full bg-white/90 text-dark-gray-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed shadow-sm hover:bg-white transition-colors"
              type="button"
              onClick={goToPrevious}
              disabled={activeIndex === 0}
              aria-label="Imagem anterior"
            >
              <svg className="w-full fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              className="gallery__arrow gallery__arrow--next absolute top-1/2 right-4 -translate-y-1/2 grid w-11 h-11 place-items-center p-2 border-0 rounded-full bg-white/90 text-dark-gray-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed shadow-sm hover:bg-white transition-colors"
              type="button"
              onClick={goToNext}
              disabled={activeIndex === images.length - 1}
              aria-label="Proxima imagem"
            >
              <svg className="w-full fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {showIndicators && (
          <div className="gallery__indicators absolute right-0 bottom-6 left-0 z-10 flex justify-center gap-2.5" aria-label="Selecionar slide">
            {images.map((image, index) => (
              <button
                className={`gallery__indicator w-3 h-3 p-0 border-0 rounded-full cursor-pointer transition-colors ${
                  index === activeIndex
                    ? 'gallery__indicator--active bg-primary'
                    : 'bg-light-gray-2'
                }`}
                key={`${image.src}-indicator-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Exibir slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {showThumbs && (
        <div className="gallery__thumbnails flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              className={`gallery__thumbnail w-[117px] h-[95px] shrink-0 basis-[117px] overflow-hidden p-0 border-2 rounded-[var(--gallery-radius)] cursor-pointer transition-colors ${
                index === activeIndex
                  ? 'gallery__thumbnail--active border-primary'
                  : 'border-transparent bg-light-gray-3'
              }`}
              style={{ borderRadius: radius }}
              key={`${image.src}-thumb-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Selecionar imagem ${index + 1}`}
            >
              <img
                className="block w-full h-full object-cover"
                style={{ borderRadius: radius }}
                src={image.src}
                alt=""
                onError={(e) => {
                  e.currentTarget.src = '/featured-k-swiss.png';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
