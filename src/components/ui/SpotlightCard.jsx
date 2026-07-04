import { useRef } from "react";

export function SpotlightCard({ children }) {
  const ref = useRef(null);

  function handleMove(event) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    element.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <article className="spotlight-card" ref={ref} onMouseMove={handleMove}>
      {children}
    </article>
  );
}
