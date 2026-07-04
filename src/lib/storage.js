import { DEFAULT_DATA } from "../data/defaultData";

export const DATA_KEY = "genuineKiwiPortfolio:data:v1";

export function createId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mergeSocials(defaultSocials, currentSocials) {
  if (!Array.isArray(currentSocials)) return defaultSocials;

  const merged = currentSocials.map((social) => {
    const fallback = defaultSocials.find(
      (item) => item.id === social.id || item.label?.toLowerCase() === social.label?.toLowerCase()
    );

    return {
      ...(fallback || {}),
      ...social,
      href: social.href || fallback?.href || "",
    };
  });

  for (const fallback of defaultSocials) {
    const exists = merged.some(
      (social) => social.id === fallback.id || social.label?.toLowerCase() === fallback.label?.toLowerCase()
    );
    if (!exists) merged.push(fallback);
  }

  return merged;
}


function normalizeServices(defaultServices, currentServices) {
  const source = Array.isArray(currentServices) ? currentServices : defaultServices;
  const normalized = source
    .filter((service) => {
      const title = String(service?.title || "").trim().toLowerCase();
      return title !== "commission support";
    })
    .map((service, index) => {
      if (service?.id === "service-1" || String(service?.title || "").trim().toLowerCase() === "roblox environments") {
        return {
          ...service,
          id: service.id || "service-1",
          title: "Roblox Environments",
          description:
            "Maps, standard buildings, exterior & interior scenes, lobbies, themed builds, and other designed areas.",
        };
      }

      if (
        service?.id === "service-2" ||
        String(service?.title || "").trim().toLowerCase() === "low-mid poly assets" ||
        String(service?.title || "").trim().toLowerCase() === "build assets"
      ) {
        return {
          ...service,
          id: service.id || "service-2",
          title: "Build Assets",
          description: "Structures, props, signage, exterior creations, and scene details.",
        };
      }

      return {
        ...service,
        id: service?.id || `service-${index + 1}`,
      };
    });

  return normalized.length ? normalized : defaultServices;
}

function mergeProjects(defaultProjects, currentProjects) {
  const source = Array.isArray(currentProjects) ? currentProjects : defaultProjects;

  return source.map((project, index) => {
    const fallback = defaultProjects.find((item) => item.id === project.id) || defaultProjects[index] || {};
    const merged = { ...fallback, ...project };
    const fallbackImages = Array.isArray(fallback.images) ? fallback.images : [];
    const currentImages = Array.isArray(project.images) ? project.images : [];
    const images = currentImages.length ? currentImages : fallbackImages;

    return {
      ...merged,
      image: merged.image || images[0]?.image || images[0]?.url || "",
      images: images.length
        ? images.map((image, imageIndex) => ({
            id: image.id || `${merged.id || "project"}-image-${imageIndex + 1}`,
            title: image.title || merged.title || "Project image",
            image: image.image || image.url || merged.image || "",
            path: image.path || "",
            description: image.description || merged.description || "",
            isCover: Boolean(image.isCover || imageIndex === 0),
          }))
        : merged.image
          ? [
              {
                id: `${merged.id || "project"}-image-1`,
                title: merged.title || "Project image",
                image: merged.image,
                path: merged.imagePath || "",
                description: merged.description || "",
                isCover: true,
              },
            ]
          : [],
    };
  });
}

export function mergeDefaults(defaults = DEFAULT_DATA, current) {
  return {
    ...defaults,
    ...current,
    profile: { ...defaults.profile, ...(current?.profile || {}) },
    stats: Array.isArray(current?.stats) ? current.stats : defaults.stats,
    services: normalizeServices(defaults.services, current?.services),
    guidelines: Array.isArray(current?.guidelines) ? current.guidelines : defaults.guidelines,
    pricing: Array.isArray(current?.pricing) ? current.pricing : defaults.pricing,
    projects: mergeProjects(defaults.projects, current?.projects),
    socials: mergeSocials(defaults.socials, current?.socials),
  };
}

export function loadPortfolioData() {
  try {
    const stored = localStorage.getItem(DATA_KEY);
    if (!stored) return DEFAULT_DATA;
    return mergeDefaults(DEFAULT_DATA, JSON.parse(stored));
  } catch {
    return DEFAULT_DATA;
  }
}

export function savePortfolioData(nextData) {
  localStorage.setItem(DATA_KEY, JSON.stringify(nextData));
}
