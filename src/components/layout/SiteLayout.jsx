import { CardNav } from "./CardNav";
import { NoiseOverlay } from "./NoiseOverlay";

export function SiteLayout({ data, route, children }) {
  return (
    <div className="app-shell grainient-bg">
      <NoiseOverlay />
      <CardNav data={data} route={route} />
      {children}
    </div>
  );
}
