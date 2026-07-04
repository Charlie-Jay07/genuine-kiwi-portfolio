import { FaCalendarCheck } from "react-icons/fa";
import { BorderGlow } from "../components/ui/BorderGlow";
import { FadeContent } from "../components/ui/FadeContent";
import { getDiscordProfileHref, getRobloxProfileHref } from "../lib/socialLinks";

export function ContactPage({ data }) {
  const discordHref = getDiscordProfileHref(data);
  const robloxHref = getRobloxProfileHref(data);

  return (
    <main>
      <section className="contact section-pad section-stack page-section">
        <FadeContent>
          <div className="section-heading">
            <p className="eyebrow">Contact</p>
            <h2>Contact</h2>
            <p>Send commission details, references, budget, deadline, and style notes.</p>
          </div>
        </FadeContent>
        <FadeContent delay={90}>
          <BorderGlow>
            <div className="contact-card">
              <p className="eyebrow">Commission enquiries</p>
              <h3>Ready to brief a Roblox build?</h3>
              <p>Use Discord for the fastest response and include enough detail to scope the build properly.</p>
              <div className="contact-list">
                <a href={discordHref} target="_blank" rel="noreferrer">
                  Discord: <strong>{data.profile.discord}</strong>
                </a>
                <a href={robloxHref} target="_blank" rel="noreferrer">
                  Roblox: <strong>{data.profile.robloxUsername || "Genuine_Kiwi"}</strong>
                </a>
                <span><FaCalendarCheck aria-hidden="true" /> Availability: <strong>{data.profile.availability}</strong></span>
              </div>
            </div>
          </BorderGlow>
        </FadeContent>
      </section>
    </main>
  );
}
