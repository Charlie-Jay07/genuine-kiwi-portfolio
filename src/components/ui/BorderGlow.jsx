export function BorderGlow({ children, className = "" }) {
  const classes = ["border-glow", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
