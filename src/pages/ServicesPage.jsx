import { FadeContent } from "../components/ui/FadeContent";
import { MagicBento } from "../components/ui/MagicBento";

export function ServicesPage({ services }) {
  return (
    <main>
      <section className="section-pad section-stack page-section">
        <FadeContent>
          <div className="section-heading narrow">
            <p className="eyebrow">Services</p>
            <h2>Services</h2>
          </div>
        </FadeContent>
        <MagicBento services={services} />
      </section>
    </main>
  );
}
