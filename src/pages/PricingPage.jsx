import { BorderGlow } from "../components/ui/BorderGlow";
import { FadeContent } from "../components/ui/FadeContent";

export function PricingPage({ pricing, guidelines }) {
  return (
    <main>
      <section className="section-pad section-stack page-section">
        <FadeContent>
          <div className="section-heading">
            <p className="eyebrow">Commission info</p>
            <h2>Pricing</h2>
            <p>Starting prices and working guidelines for Genuine_Kiwi commissions.</p>
          </div>
        </FadeContent>
        <div className="split-layout">
          <BorderGlow>
            <div className="price-card glass-card">
              <h3>Minimum pricing</h3>
              {pricing.map((item) => (
                <div className="price-row" key={item.id}>
                  <div>
                    <span>{item.name}</span>
                    <strong>{item.amount}</strong>
                  </div>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          </BorderGlow>
          <div className="guideline-card glass-card">
            <h3>Before commissioning</h3>
            <ul>
              {guidelines.map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
