import { BorderGlow } from "./BorderGlow";
import { FadeContent } from "./FadeContent";

export function MagicBento({ services }) {
  const featuredServices = services.slice(0, 2);
  const remainingServices = services.slice(2);

  return (
    <div className="magic-bento">
      <BorderGlow className="bento-feature-wrap">
        <div className="bento-card large">
          <div className="bento-feature-copy">
            <p className="eyebrow">Speciality</p>
            <h3>Stylized builds for Roblox experiences.</h3>
          </div>
          <div className="bento-feature-logo-frame" aria-hidden="true">
            <img src="/assets/brand/roblox-studio-logo.png" alt="" />
          </div>
        </div>
      </BorderGlow>

      <div className="bento-service-stack">
        {featuredServices.map((service, index) => (
          <FadeContent key={service.id} delay={index * 70}>
            <div className="bento-card service-card">
              <span className="bento-number">0{index + 1}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          </FadeContent>
        ))}
      </div>

      {remainingServices.map((service, index) => (
        <FadeContent key={service.id} delay={(index + featuredServices.length) * 70} className="bento-wide">
          <div className="bento-card service-card service-card-wide">
            <span className="bento-number">0{index + featuredServices.length + 1}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        </FadeContent>
      ))}
    </div>
  );
}
