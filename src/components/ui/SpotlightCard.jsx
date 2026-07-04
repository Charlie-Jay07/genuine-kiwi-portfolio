import { useRef } from "react";

export function SpotlightCard({ children }) {
  const ref = useRef(null);

  function handleMove(event) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xPercent = (x / rect.width - 0.5) * 2;
    const yPercent = (y / rect.height - 0.5) * 2;

    element.style.setProperty("--spot-x", `${x}px`);
    element.style.setProperty("--spot-y", `${y}px`);
    element.style.setProperty("--tilt-x", `${(-yPercent * 7).toFixed(2)}deg`);
    element.style.setProperty("--tilt-y", `${(xPercent * 7).toFixed(2)}deg`);
    element.style.setProperty("--card-lift", "-8px");
  }

  function handleLeave() {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--card-lift", "0px");
  }

  return (
    <article
      className="spotlight-card"
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </article>
  );
}
