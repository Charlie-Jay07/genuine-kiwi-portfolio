import { useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaImages,
  FaTimes,
} from "react-icons/fa";
import { Carousel } from "../components/ui/Carousel";
import { FadeContent } from "../components/ui/FadeContent";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { getProjectCover, getProjectImageCount } from "../lib/projectMedia";

function isProjectFeatured(project) {
  return project.featured === true;
}

function ensureProjectImages(project = {}) {
  if (Array.isArray(project.images) && project.images.length) {
    return project.images.filter((image) => image?.image);
  }

  if (!project.image) return [];

  return [
    {
      id: `${project.id}-image-1`,
      title: project.title || "Project image",
      image: project.image,
      path: project.imagePath || "",
      description: project.description || "",
      isCover: true,
    },
  ];
}

export function WorkPage({ projects = [] }) {
  const [galleryProject, setGalleryProject] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const featuredProjects = useMemo(
    () => projects.filter((project) => isProjectFeatured(project)),
    [projects],
  );

  const gridProjects = useMemo(
    () => projects.filter((project) => !isProjectFeatured(project)),
    [projects],
  );

  const galleryImages = galleryProject
    ? ensureProjectImages(galleryProject)
    : [];
  const activeGalleryImage = galleryImages[activeImageIndex];

  function openGallery(project) {
    const images = ensureProjectImages(project);
    if (!images.length) return;

    setGalleryProject(project);
    setActiveImageIndex(0);
  }

  function closeGallery() {
    setGalleryProject(null);
    setActiveImageIndex(0);
  }

  function moveGalleryImage(direction) {
    setActiveImageIndex((currentIndex) => {
      if (!galleryImages.length) return 0;
      return (
        (currentIndex + direction + galleryImages.length) % galleryImages.length
      );
    });
  }

  return (
    <main>
      <section className="section-pad section-stack page-section">
        <FadeContent>
          <div className="section-heading">
            <h2>My Work</h2>
          </div>
        </FadeContent>

        {featuredProjects.length > 0 && (
          <FadeContent delay={90}>
            <Carousel items={featuredProjects} autoplayDelay={4000} />
          </FadeContent>
        )}

        <div className="work-more-cue" aria-hidden="true">
          <span>
            {featuredProjects.length > 0 ? "More Projects" : "Projects"}
          </span>
          <i />
        </div>

        <div className="project-grid work-project-grid">
          {gridProjects.map((project, index) => {
            const imageCount = getProjectImageCount(project);
            const cover = getProjectCover(project);

            return (
              <FadeContent key={project.id} delay={index * 70}>
                <SpotlightCard>
                  <button
                    className="project-thumb-button"
                    type="button"
                    onClick={() => openGallery(project)}
                    aria-label={`Open ${project.title} gallery`}
                  >
                    <div className="project-thumb-wrap">
                      {cover ? (
                        <img src={cover} alt={project.title} />
                      ) : (
                        <div className="project-thumb-empty">No image</div>
                      )}

                      {imageCount > 1 && (
                        <span className="project-image-count">
                          <FaImages aria-hidden="true" /> {imageCount} images
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="project-card-copy">
                    <span>{project.category}</span>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                </SpotlightCard>
              </FadeContent>
            );
          })}
        </div>
      </section>

      {galleryProject && activeGalleryImage && (
        <div
          className="project-gallery-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closeGallery}
        >
          <div
            className="project-gallery-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="project-gallery-close"
              type="button"
              onClick={closeGallery}
              aria-label="Close gallery"
            >
              <FaTimes aria-hidden="true" />
            </button>

            <div className="project-gallery-header">
              <span>{galleryProject.category}</span>
              <h2>{galleryProject.title}</h2>
              <p>{galleryProject.description}</p>
            </div>

            <div className="project-gallery-stage">
              {galleryImages.length > 1 && (
                <button
                  className="project-gallery-arrow project-gallery-arrow-left"
                  type="button"
                  onClick={() => moveGalleryImage(-1)}
                  aria-label="Previous image"
                >
                  <FaChevronLeft aria-hidden="true" />
                </button>
              )}

              <img
                src={activeGalleryImage.image}
                alt={activeGalleryImage.title || galleryProject.title}
              />

              {galleryImages.length > 1 && (
                <button
                  className="project-gallery-arrow project-gallery-arrow-right"
                  type="button"
                  onClick={() => moveGalleryImage(1)}
                  aria-label="Next image"
                >
                  <FaChevronRight aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="project-gallery-caption">
              <h3>{activeGalleryImage.title || galleryProject.title}</h3>
              {activeGalleryImage.description && (
                <p>{activeGalleryImage.description}</p>
              )}
              <span>
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
            </div>

            {galleryImages.length > 1 && (
              <div className="project-gallery-thumbs">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.id || image.image}
                    className={`project-gallery-thumb ${index === activeImageIndex ? "active" : ""}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img src={image.image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
