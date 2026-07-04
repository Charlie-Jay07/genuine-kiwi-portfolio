export const PROJECT_PLACEHOLDER_IMAGE = "/assets/brand/genuine-kiwi-profile.png";

export function getProjectImages(project) {
  if (!project) return [];

  const collectionImages = Array.isArray(project.images)
    ? project.images
        .filter((item) => item?.image || item?.url)
        .map((item, index) => ({
          id: item.id || `${project.id || "project"}-image-${index}`,
          title: item.title || project.title || "Project image",
          category: item.category || project.category || "Project",
          description: item.description || project.description || "",
          image: item.image || item.url,
          url: item.image || item.url,
          path: item.path || "",
          isCover: Boolean(item.isCover),
        }))
    : [];

  if (collectionImages.length) return collectionImages;

  if (project.image) {
    return [
      {
        id: `${project.id || "project"}-cover`,
        title: project.title || "Project image",
        category: project.category || "Project",
        description: project.description || "",
        image: project.image,
        url: project.image,
        path: project.imagePath || "",
        isCover: true,
      },
    ];
  }

  return [];
}

export function getProjectCover(project) {
  const images = getProjectImages(project);
  const markedCover = images.find((image) => image.isCover);
  return markedCover?.image || images[0]?.image || project?.image || PROJECT_PLACEHOLDER_IMAGE;
}

export function getProjectImageCount(project) {
  return getProjectImages(project).length;
}
