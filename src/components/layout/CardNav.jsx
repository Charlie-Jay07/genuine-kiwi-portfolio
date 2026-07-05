import { useEffect, useState } from "react";
import { FaBars, FaTimes, FaUserShield } from "react-icons/fa";
import { cleanDisplayName } from "../../lib/format";

const navItems = [
  { route: "home", label: "Home" },
  { route: "work", label: "Work" },
  { route: "services", label: "Services" },
  { route: "pricing", label: "Pricing" },
  { route: "contact", label: "Contact" },
];

export function CardNav({ data, route }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const brandName = cleanDisplayName(data.profile.brand);

  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.body.classList.toggle("mobile-menu-open", menuOpen);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("mobile-menu-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className={`card-nav ${menuOpen ? "menu-open" : ""}`}>
      <div className="brand-area">
        <a
          className="brand"
          href="#home"
          aria-label="Go to home"
          onClick={closeMenu}
        >
          <span className="brand-mark image-mark">
            {data.profile.logoImage ? (
              <img src={data.profile.logoImage} alt="" />
            ) : (
              "GK"
            )}
          </span>
          <span>{brandName}</span>
        </a>
      </div>

      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-controls="site-navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        {menuOpen ? (
          <FaTimes aria-hidden="true" />
        ) : (
          <FaBars aria-hidden="true" />
        )}
      </button>

      <button
        className={`mobile-menu-backdrop ${menuOpen ? "is-open" : ""}`}
        type="button"
        aria-label="Close navigation menu"
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMenu}
      />

      <nav
        id="site-navigation"
        className={`site-nav ${menuOpen ? "is-open" : ""}`}
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <a
            key={item.route}
            className={route === item.route ? "active" : ""}
            href={`#${item.route}`}
            onClick={closeMenu}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
