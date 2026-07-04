import { useRef } from "react";

export function Magnet({ children, strength = 0.22 }) {
  const ref = useRef(null);

  function handleMove(event) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * strength;
    const y = (event.clientY - rect.top - rect.height / 2) * strength;
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = "translate3d(0, 0, 0)";
  }

  return (
    <span ref={ref} className="magnet" onMouseMove={handleMove} onMouseLeave={reset}>
      {children}
    </span>
  );
}
