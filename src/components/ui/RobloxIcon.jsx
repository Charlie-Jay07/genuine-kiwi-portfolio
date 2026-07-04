const ROBLOX_LOGO_SRC = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roblox_Logo.svg/960px-Roblox_Logo.svg.png?_=20220929193725";

export function RobloxIcon({ className = "", ...props }) {
  return (
    <span
      className={`roblox-logo-shell ${className}`.trim()}
      aria-hidden="true"
      title="Roblox"
      {...props}
    >
      <img
        className="roblox-logo-img"
        src={ROBLOX_LOGO_SRC}
        alt=""
        draggable="false"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <span className="roblox-logo-fallback" aria-hidden="true" />
    </span>
  );
}

export { ROBLOX_LOGO_SRC };
