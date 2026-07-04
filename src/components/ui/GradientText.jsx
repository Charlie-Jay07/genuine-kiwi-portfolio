import { cleanDisplayName } from "../../lib/format";

export function GradientText({ children }) {
  if (typeof children !== "string") {
    return <span className="gradient-text">{children}</span>;
  }

  const safeText = cleanDisplayName(children);

  return (
    <span className="gradient-text" aria-label={safeText}>
      {Array.from(safeText).map((char, index) =>
        char === "_" ? (
          <span key={`underscore-${index}`} className="gradient-underscore">
            _
          </span>
        ) : (
          <span key={`${char}-${index}`} className="gradient-text-part">
            {char}
          </span>
        ),
      )}
    </span>
  );
}
