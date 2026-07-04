import { useEffect, useMemo, useState } from "react";

const VALID_ROUTES = ["home", "work", "services", "pricing", "contact", "admin"];

function readRoute() {
  const raw = window.location.hash.replace("#", "").replace(/^\//, "") || "home";

  if (raw.includes("access_token=") || raw.includes("error=")) return "admin";

  const route = raw.split(/[?&=]/)[0];
  return VALID_ROUTES.includes(route) ? route : "home";
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return useMemo(() => route, [route]);
}
