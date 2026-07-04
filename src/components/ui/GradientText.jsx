export function GradientText({ children }) {
  if (typeof children !== "string") {
    return <span className="gradient-text">{children}</span>;
  }

  const parts = children.split("_");

  return (
    <span className="gradient-text">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="gradient-text-part">
          {part}
          {index < parts.length - 1 ? <span className="gradient-underscore">_</span> : null}
        </span>
      ))}
    </span>
  );
}
