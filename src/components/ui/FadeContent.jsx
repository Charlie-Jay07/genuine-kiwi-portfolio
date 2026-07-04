import { useEffect, useRef, useState } from "react";

export function FadeContent({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={["fade-content", visible ? "is-visible" : "", className].filter(Boolean).join(" ")} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
