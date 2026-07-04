import { FaImages } from "react-icons/fa";
import { Carousel } from "../components/ui/Carousel";
import { FadeContent } from "../components/ui/FadeContent";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { getProjectCover, getProjectImageCount } from "../lib/projectMedia";

export function WorkPage({ projects }) {
  return (
    <main>
      <section className="section-pad section-stack page-section">
        <FadeContent>
          <div className="section-heading">
            <h2>My Work</h2>
          </div>
        </FadeContent>
        <FadeContent delay={90}>
          <Carousel items={projects} autoplayDelay={4000} />
        </FadeContent>
        <div className="project-grid">
          {projects.map((project, index) => {
            const imageCount = getProjectImageCount(project);
            return (
              <FadeContent key={project.id} delay={index * 70}>
                <SpotlightCard>
                  <div className="project-thumb-wrap">
                    <img src={getProjectCover(project)} alt={project.title} />
                    {imageCount > 1 && (
                      <span className="project-image-count">
                        <FaImages aria-hidden="true" /> {imageCount} images
                      </span>
                    )}
                  </div>
                  <div>
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
    </main>
  );
}
