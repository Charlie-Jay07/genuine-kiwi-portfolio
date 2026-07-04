import { FaBriefcase, FaImages } from "react-icons/fa";
import { BorderGlow } from "../components/ui/BorderGlow";
import { FadeContent } from "../components/ui/FadeContent";
import { GradientText } from "../components/ui/GradientText";
import { TiltedCard } from "../components/ui/TiltedCard";

export function HomePage({ data }) {
  return (
    <main>
      <section className="hero section-pad page-section">
        <div className="hero-copy">
          <FadeContent>
            <h1>
              <span className="hero-name-line">
                <GradientText>{data.profile.displayName}</GradientText>
              </span>
              <span className="hero-role">{data.profile.role}</span>
            </h1>
            <p className="hero-text">{data.profile.headline}</p>
            <p className="body-copy">{data.profile.about}</p>
            <div className="hero-actions">
              <a className="primary-button stable-button" href="#contact"><FaBriefcase aria-hidden="true" /> Commission enquiry</a>
              <a className="ghost-button stable-button" href="#work"><FaImages aria-hidden="true" /> View work</a>
            </div>
          </FadeContent>
        </div>
        <FadeContent delay={110}>
          <TiltedCard>
            <BorderGlow>
              <div className="hero-card profile-card">
                <img src={data.profile.heroImage || data.profile.avatarImage} alt={`${data.profile.displayName} profile visual`} />
                <div className="hero-card-footer">
                  <span>Builder profile</span>
                  <strong>{data.profile.displayName}</strong>
                </div>
              </div>
            </BorderGlow>
          </TiltedCard>
        </FadeContent>
      </section>
    </main>
  );
}
