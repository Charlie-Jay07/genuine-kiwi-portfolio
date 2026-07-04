import { FaUserShield } from "react-icons/fa";
import { cleanDisplayName } from "../../lib/format";

const navItems = [
  { route: "home", label: "Home" },
  { route: "work", label: "Work" },
  { route: "services", label: "Services" },
  { route: "pricing", label: "Pricing" },
  { route: "contact", label: "Contact" },
];

export function CardNav({ data, route }) {
  const brandName = cleanDisplayName(data.profile.brand);

  return (
    <header className="card-nav">
      <div className="brand-area">
        <a className="brand" href="#home" aria-label="Go to home">
          <span className="brand-mark image-mark">
            {data.profile.logoImage ? <img src={data.profile.logoImage} alt="" /> : "GK"}
          </span>
          <span>{brandName}</span>
        </a>

      </div>
      <nav aria-label="Main navigation">
        {navItems.map((item) => (
          <a key={item.route} className={route === item.route ? "active" : ""} href={`#${item.route}`}>
            {item.label}
          </a>
        ))}
        <a href="#admin" className={`admin-link ${route === "admin" ? "active" : ""}`}>
          <FaUserShield aria-hidden="true" />
          Admin
        </a>
      </nav>
    </header>
  );
}
