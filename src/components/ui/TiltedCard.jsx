import { useRef } from "react";

export function TiltedCard({ children }) {
  const ref = useRef(null);

  function handleMove(event) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = (y / rect.height - 0.5) * -5;
    const rotateY = (x / rect.width - 0.5) * 5;
    element.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  }

  return (
    <div className="tilted-card" ref={ref} onMouseMove={handleMove} onMouseLeave={reset}>
      {children}
    </div>
  );
}
