import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronLeft, FaChevronRight, FaImages, FaPause, FaPlay, FaSearchPlus, FaTimes } from "react-icons/fa";
import { DEFAULT_DATA } from "../../data/defaultData";
import { getProjectCover, getProjectImageCount, getProjectImages } from "../../lib/projectMedia";

const LIGHTBOX_CLOSE_DELAY = 260;

export function Carousel({ items, autoplayDelay = 4000 }) {
  const [index, setIndex] = useState(0);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const safeItems = items.length ? items : DEFAULT_DATA.projects;

  const active = safeItems[index] || safeItems[0];
  const lightboxImages = useMemo(() => getProjectImages(lightboxItem), [lightboxItem]);
  const activeLightboxImage = lightboxImages[lightboxIndex] || lightboxImages[0];

  function goTo(nextIndex) {
    setIndex((nextIndex + safeItems.length) % safeItems.length);
  }

  function openLightbox(item) {
    if (!getProjectImages(item).length) return;
    setIsClosing(false);
    setLightboxItem(item);
    setLightboxIndex(0);
  }

  function closeLightbox() {
    if (!lightboxItem || isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      setLightboxItem(null);
      setLightboxIndex(0);
      setIsClosing(false);
    }, LIGHTBOX_CLOSE_DELAY);
  }

  function goLightbox(nextIndex) {
    if (!lightboxImages.length) return;
    setLightboxIndex((nextIndex + lightboxImages.length) % lightboxImages.length);
  }

  useEffect(() => {
    if (lightboxItem || isPaused || isHoverPaused || safeItems.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safeItems.length);
    }, autoplayDelay);

    return () => window.clearInterval(timer);
  }, [safeItems.length, autoplayDelay, lightboxItem, isPaused, isHoverPaused]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") goLightbox(lightboxIndex - 1);
      if (event.key === "ArrowRight") goLightbox(lightboxIndex + 1);
    }

    if (!lightboxItem) return undefined;

    document.body.classList.add("lightbox-open");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxItem, lightboxIndex, lightboxImages.length]);

  const lightbox = lightboxItem && activeLightboxImage ? (
    <div
      className={`image-lightbox ${isClosing ? "closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${lightboxItem.title} preview`}
      onMouseDown={closeLightbox}
    >
      <figure className="image-lightbox-panel" onMouseDown={(event) => event.stopPropagation()}>
        <button className="image-lightbox-close" type="button" onClick={closeLightbox} aria-label="Close image preview">
          <FaTimes aria-hidden="true" />
        </button>
        {lightboxImages.length > 1 && (
          <>
            <button
              className="image-lightbox-nav left"
              type="button"
              onClick={() => goLightbox(lightboxIndex - 1)}
              aria-label="Previous image in this project"
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
            <button
              className="image-lightbox-nav right"
              type="button"
              onClick={() => goLightbox(lightboxIndex + 1)}
              aria-label="Next image in this project"
            >
              <FaChevronRight aria-hidden="true" />
            </button>
          </>
        )}
        <img src={activeLightboxImage.image} alt={activeLightboxImage.title || lightboxItem.title} />
        <figcaption>
          <span>{lightboxItem.category}</span>
          <strong>{activeLightboxImage.title || lightboxItem.title}</strong>
          <p>{activeLightboxImage.description || lightboxItem.description}</p>
          {lightboxImages.length > 1 && (
            <div className="image-lightbox-count">
              <FaImages aria-hidden="true" /> Image {lightboxIndex + 1} of {lightboxImages.length}
            </div>
          )}
        </figcaption>
      </figure>
    </div>
  ) : null;

  return (
    <>
      <div
        className="carousel-wrap"
        style={{ "--base-width": "330px" }}
        onMouseEnter={() => setIsHoverPaused(true)}
        onMouseLeave={() => setIsHoverPaused(false)}
      >
        <div className="carousel-track" aria-live="polite">
          <button className="carousel-button left" type="button" onClick={() => goTo(index - 1)} aria-label="Previous project">
            <FaChevronLeft aria-hidden="true" />
          </button>
          {safeItems.map((item, itemIndex) => {
            const offset = itemIndex - index;
            const normalizedOffset = offset > safeItems.length / 2 ? offset - safeItems.length : offset;
            const normalized = normalizedOffset < -safeItems.length / 2 ? normalizedOffset + safeItems.length : normalizedOffset;
            const imageCount = getProjectImageCount(item);
            return (
              <button
                type="button"
                className={`carousel-card ${itemIndex === index ? "active" : ""}`}
                key={item.id}
                onClick={() => openLightbox(item)}
                aria-label={`Open ${item.title} collection`}
                style={{
                  transform: `translateX(${normalized * 48}%) scale(${itemIndex === index ? 1 : 0.84})`,
                  opacity: Math.abs(normalized) > 1 ? 0 : itemIndex === index ? 1 : 0.42,
                  zIndex: itemIndex === index ? 3 : 2,
                  pointerEvents: Math.abs(normalized) > 1 ? "none" : "auto",
                }}
              >
                <img src={getProjectCover(item)} alt={item.title} />
                <span className="carousel-open-hint">
                  <FaSearchPlus aria-hidden="true" />
                  {imageCount > 1 ? `${imageCount} images` : "View"}
                </span>
              </button>
            );
          })}
          <button className="carousel-button right" type="button" onClick={() => goTo(index + 1)} aria-label="Next project">
            <FaChevronRight aria-hidden="true" />
          </button>
        </div>
        {active && (
          <div className="carousel-info">
            <span>{active.category}</span>
            <h3>{active.title}</h3>
            <p>{active.description}</p>
          </div>
        )}
        <div className="carousel-footer-controls">
          {safeItems.length > 1 && (
            <button
              className="carousel-pause-toggle"
              type="button"
              onClick={() => setIsPaused((current) => !current)}
              aria-pressed={isPaused}
              aria-label={isPaused ? "Resume carousel autoplay" : "Pause carousel autoplay"}
            >
              {isPaused ? <FaPlay aria-hidden="true" /> : <FaPause aria-hidden="true" />}
              {isPaused ? "Resume" : isHoverPaused ? "Paused on hover" : "Pause"}
            </button>
          )}
          <div className="carousel-dots" role="tablist" aria-label="Project slides">
            {safeItems.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                className={itemIndex === index ? "active" : ""}
                onClick={() => goTo(itemIndex)}
                aria-label={`Go to ${item.title}`}
              />
            ))}
          </div>
        </div>
      </div>

      {lightbox ? createPortal(lightbox, document.body) : null}
    </>
  );
}
