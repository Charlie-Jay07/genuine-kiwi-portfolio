import { useRef, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCloudUploadAlt,
  FaImages,
  FaPlus,
  FaStar,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
} from "react-icons/fa";
import { Field } from "../../components/ui/Field";
import {
  deletePortfolioImage,
  isSupabaseStorageReady,
  uploadPortfolioImage,
} from "../../lib/portfolioApi";
import { getProjectCover } from "../../lib/projectMedia";
import { createId } from "../../lib/storage";

function isProjectFeatured(project) {
  return project.featured === true;
}

function ensureProjectImages(project = {}) {
  if (Array.isArray(project.images) && project.images.length) {
    return project.images.map((image, index) => ({
      id: image.id || `${project.id || "project"}-image-${index + 1}`,
      title: image.title || "Project image",
      image: image.image || "",
      path: image.path || "",
      description: image.description || "",
      isCover: image.isCover === true,
      createdAt:
        image.createdAt || project.createdAt || new Date().toISOString(),
      updatedAt: image.updatedAt || "",
    }));
  }

  if (!project.image) return [];

  return [
    {
      id: `${project.id}-image-1`,
      title: project.title || "Project image",
      image: project.image,
      path: project.imagePath || "",
      description: project.description || "",
      isCover: true,
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: project.updatedAt || "",
    },
  ];
}

function stripFileExtension(fileName = "Project image") {
  return (
    fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim() || "Project image"
  );
}

function swapItems(list, index, targetIndex) {
  if (targetIndex < 0 || targetIndex >= list.length) return list;

  const nextList = [...list];
  const currentItem = nextList[index];

  nextList[index] = nextList[targetIndex];
  nextList[targetIndex] = currentItem;

  return nextList;
}

export function ProjectsEditor({ data, setData }) {
  const fileInputs = useRef({});
  const [uploadStatus, setUploadStatus] = useState({});
  const storageReady = isSupabaseStorageReady();

  function updateProject(id, field, value) {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== id) return project;

        if (field === "image") {
          const images = ensureProjectImages(project);
          const hasImages = images.length > 0;

          const nextImages = hasImages
            ? images.map((image, index) =>
                image.isCover ||
                (!images.some((item) => item.isCover) && index === 0)
                  ? {
                      ...image,
                      image: value,
                      isCover: true,
                      updatedAt: new Date().toISOString(),
                    }
                  : image,
              )
            : value
              ? [
                  {
                    id: createId("image"),
                    title: project.title || "Project image",
                    image: value,
                    path: "",
                    description: project.description || "",
                    isCover: true,
                    createdAt: new Date().toISOString(),
                  },
                ]
              : [];

          return {
            ...project,
            image: value,
            images: nextImages,
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          ...project,
          [field]: value,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }

  function updateProjectImage(projectId, imageId, field, value) {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== projectId) return project;

        const images = ensureProjectImages(project).map((image) =>
          image.id === imageId
            ? {
                ...image,
                [field]: value,
                updatedAt: new Date().toISOString(),
              }
            : image,
        );

        const cover =
          images.find((image) => image.isCover) ||
          images.find((image) => image.image) ||
          images[0];

        return {
          ...project,
          image: cover?.image || "",
          images,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }

  function addProject() {
    const id = createId("project");

    setData((current) => ({
      ...current,
      projects: [
        {
          id,
          title: "New portfolio collection",
          category: "Build collection",
          image: "",
          description: "Add a short description for this build.",
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: [],
        },
        ...current.projects,
      ],
    }));

    setUploadStatus((current) => ({
      ...current,
      [id]: "Collection created. Drag images into it or use Upload images.",
    }));
  }

  async function removeProject(id) {
    const project = data.projects.find((item) => item.id === id);
    const shouldRemove = window.confirm(
      `Remove ${project?.title || "this project"}?`,
    );
    if (!shouldRemove) return;

    setData((current) => ({
      ...current,
      projects: current.projects.filter((projectItem) => projectItem.id !== id),
    }));
  }

  function moveProject(projectId, direction) {
    setData((current) => {
      const currentIndex = current.projects.findIndex(
        (project) => project.id === projectId,
      );
      if (currentIndex === -1) return current;

      return {
        ...current,
        projects: swapItems(
          current.projects,
          currentIndex,
          currentIndex + direction,
        ),
      };
    });
  }

  function toggleProjectFeatured(projectId) {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              featured: !isProjectFeatured(project),
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    }));
  }

  function addManualImage(projectId) {
    const imageId = createId("image");

    setData((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== projectId) return project;

        const images = ensureProjectImages(project);

        const nextImage = {
          id: imageId,
          title: "New image",
          image: "",
          path: "",
          description: "Image description.",
          isCover: images.length === 0,
          createdAt: new Date().toISOString(),
        };

        const nextImages = [...images, nextImage];

        return {
          ...project,
          image: project.image || nextImage.image,
          images: nextImages,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }

  async function removeProjectImage(projectId, imageId) {
    const project = data.projects.find((item) => item.id === projectId);
    const image = ensureProjectImages(project).find(
      (item) => item.id === imageId,
    );
    const shouldRemove = window.confirm(
      `Remove ${image?.title || "this image"}?`,
    );
    if (!shouldRemove) return;

    if (image?.path) {
      try {
        await deletePortfolioImage(image.path);
      } catch (error) {
        setUploadStatus((current) => ({
          ...current,
          [projectId]: `Image removed from the portfolio, but Supabase Storage delete failed: ${error.message}`,
        }));
      }
    }

    setData((current) => ({
      ...current,
      projects: current.projects.map((projectItem) => {
        if (projectItem.id !== projectId) return projectItem;

        const remaining = ensureProjectImages(projectItem).filter(
          (item) => item.id !== imageId,
        );
        const hasCover = remaining.some((item) => item.isCover);

        const nextImages = remaining.map((item, index) => ({
          ...item,
          isCover: hasCover ? item.isCover : index === 0,
        }));

        const cover = nextImages.find((item) => item.isCover) || nextImages[0];

        return {
          ...projectItem,
          image: cover?.image || "",
          images: nextImages,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }

  function setCoverImage(projectId, imageId) {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== projectId) return project;

        const images = ensureProjectImages(project).map((image) => ({
          ...image,
          isCover: image.id === imageId,
        }));

        const cover = images.find((image) => image.id === imageId);

        return {
          ...project,
          image: cover?.image || project.image || "",
          images,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }

  function moveProjectImage(projectId, imageId, direction) {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== projectId) return project;

        const images = ensureProjectImages(project);
        const currentIndex = images.findIndex((image) => image.id === imageId);
        if (currentIndex === -1) return project;

        const nextImages = swapItems(
          images,
          currentIndex,
          currentIndex + direction,
        );
        const cover =
          nextImages.find((image) => image.isCover) || nextImages[0];

        return {
          ...project,
          image: cover?.image || "",
          images: nextImages,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }

  async function uploadFiles(project, fileList) {
    const files = Array.from(fileList || []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!files.length) return;

    if (!storageReady) {
      setUploadStatus((current) => ({
        ...current,
        [project.id]:
          "Supabase Storage is not configured. Add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and run supabase/schema.sql.",
      }));
      return;
    }

    setUploadStatus((current) => ({
      ...current,
      [project.id]: `Uploading ${files.length} image${files.length === 1 ? "" : "s"}...`,
    }));

    try {
      const uploadedImages = [];

      for (const file of files) {
        const uploaded = await uploadPortfolioImage(file, project.id);

        uploadedImages.push({
          id: createId("image"),
          title: stripFileExtension(file.name),
          image: uploaded.url,
          path: uploaded.path,
          description: "",
          isCover: false,
          createdAt: new Date().toISOString(),
        });
      }

      setData((current) => ({
        ...current,
        projects: current.projects.map((projectItem) => {
          if (projectItem.id !== project.id) return projectItem;

          const existingImages = ensureProjectImages(projectItem);
          const existingImagesWithUrls = existingImages.filter(
            (image) => image.image,
          );
          const shouldMarkFirstUploadAsCover =
            existingImagesWithUrls.length === 0;

          const nextUploaded = uploadedImages.map((image, index) => ({
            ...image,
            isCover: shouldMarkFirstUploadAsCover && index === 0,
          }));

          const nextImages = [...existingImages, ...nextUploaded];
          const cover =
            nextImages.find((image) => image.isCover) ||
            nextImages.find((image) => image.image) ||
            nextImages[0];

          return {
            ...projectItem,
            image: cover?.image || "",
            images: nextImages,
            updatedAt: new Date().toISOString(),
          };
        }),
      }));

      setUploadStatus((current) => ({
        ...current,
        [project.id]:
          "Upload complete. The collection will autosave to Supabase.",
      }));
    } catch (error) {
      setUploadStatus((current) => ({
        ...current,
        [project.id]:
          error.message ||
          "Upload failed. Check the Supabase Storage bucket and policies.",
      }));
    }
  }

  return (
    <div className="editor-stack">
      <div className="editor-heading-row">
        <div>
          <h2>Projects</h2>
          <p className="form-note">
            Each project is a portfolio collection. Toggle carousel projects,
            reorder them, and add multiple images per build.
          </p>
        </div>

        <button className="ghost-button" type="button" onClick={addProject}>
          <FaPlus aria-hidden="true" /> Add project
        </button>
      </div>

      {!storageReady && (
        <p className="form-error">
          Supabase Storage is not ready. Image drag/drop uploads need Supabase
          env values and the Storage bucket from supabase/schema.sql.
        </p>
      )}

      <div className="admin-list">
        {data.projects.map((project, projectIndex) => {
          const images = ensureProjectImages(project);
          const cover = getProjectCover(project);
          const featured = isProjectFeatured(project);

          return (
            <div
              className="admin-item project-editor collection-editor"
              key={project.id}
            >
              <div className="project-collection-toolbar">
                <div>
                  <span>
                    {featured
                      ? "Featured carousel project"
                      : "Standard project"}
                  </span>
                  <h3>{project.title || "Untitled project"}</h3>
                </div>

                <div className="project-toolbar-actions">
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => moveProject(project.id, -1)}
                    disabled={projectIndex === 0}
                  >
                    <FaArrowUp aria-hidden="true" /> Move up
                  </button>

                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => moveProject(project.id, 1)}
                    disabled={projectIndex === data.projects.length - 1}
                  >
                    <FaArrowDown aria-hidden="true" /> Move down
                  </button>

                  <button
                    className={`ghost-button project-feature-toggle ${featured ? "active" : ""}`}
                    type="button"
                    onClick={() => toggleProjectFeatured(project.id)}
                  >
                    {featured ? (
                      <FaToggleOn aria-hidden="true" />
                    ) : (
                      <FaToggleOff aria-hidden="true" />
                    )}
                    {featured ? "On carousel" : "Add to carousel"}
                  </button>

                  <button
                    className="danger-button project-remove-button"
                    type="button"
                    onClick={() => removeProject(project.id)}
                  >
                    <FaTrash aria-hidden="true" /> Remove project
                  </button>
                </div>
              </div>

              <div className="project-cover-preview">
                {cover ? (
                  <img src={cover} alt="" />
                ) : (
                  <div className="empty-cover">
                    <FaImages aria-hidden="true" /> No cover yet
                  </div>
                )}

                <span>
                  {images.length} image{images.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="project-editor-main">
                <div className="form-grid project-details-grid">
                  <Field
                    label="Collection / project title"
                    value={project.title || ""}
                    onChange={(value) =>
                      updateProject(project.id, "title", value)
                    }
                  />

                  <Field
                    label="Category"
                    value={project.category || ""}
                    onChange={(value) =>
                      updateProject(project.id, "category", value)
                    }
                  />

                  <Field
                    label="Main description"
                    value={project.description || ""}
                    multiline
                    onChange={(value) =>
                      updateProject(project.id, "description", value)
                    }
                  />

                  <Field
                    label="Cover image URL"
                    value={project.image || ""}
                    onChange={(value) =>
                      updateProject(project.id, "image", value)
                    }
                  />
                </div>

                <div
                  className="upload-dropzone"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    uploadFiles(project, event.dataTransfer.files);
                  }}
                >
                  <FaCloudUploadAlt aria-hidden="true" />

                  <div>
                    <strong>Drag and drop images here</strong>
                    <span>
                      Uploads go to the Supabase Storage bucket, then save into
                      this collection.
                    </span>
                  </div>

                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => fileInputs.current[project.id]?.click()}
                  >
                    Upload images
                  </button>

                  <input
                    ref={(element) => {
                      fileInputs.current[project.id] = element;
                    }}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      uploadFiles(project, event.target.files);
                      event.target.value = "";
                    }}
                  />
                </div>

                {uploadStatus[project.id] && (
                  <p className="form-note">{uploadStatus[project.id]}</p>
                )}

                <div className="collection-images-header">
                  <h3>Collection images</h3>

                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => addManualImage(project.id)}
                  >
                    <FaPlus aria-hidden="true" /> Add image manually
                  </button>
                </div>

                <div className="collection-image-list">
                  {images.length === 0 && (
                    <p className="form-note">
                      No images in this collection yet. Upload images to
                      Supabase Storage above.
                    </p>
                  )}

                  {images.map((image, imageIndex) => (
                    <div className="collection-image-editor" key={image.id}>
                      <div className="collection-image-thumb">
                        {image.image ? (
                          <img src={image.image} alt="" />
                        ) : (
                          <div>No image</div>
                        )}
                      </div>

                      <div className="form-grid collection-image-fields">
                        <Field
                          label="Image title"
                          value={image.title || ""}
                          onChange={(value) =>
                            updateProjectImage(
                              project.id,
                              image.id,
                              "title",
                              value,
                            )
                          }
                        />

                        <Field
                          label="Image URL"
                          value={image.image || ""}
                          onChange={(value) =>
                            updateProjectImage(
                              project.id,
                              image.id,
                              "image",
                              value,
                            )
                          }
                        />

                        <Field
                          label="Image description"
                          value={image.description || ""}
                          multiline
                          onChange={(value) =>
                            updateProjectImage(
                              project.id,
                              image.id,
                              "description",
                              value,
                            )
                          }
                        />

                        <Field
                          label="Supabase path"
                          value={image.path || ""}
                          onChange={(value) =>
                            updateProjectImage(
                              project.id,
                              image.id,
                              "path",
                              value,
                            )
                          }
                        />
                      </div>

                      <div className="collection-image-actions">
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() =>
                            moveProjectImage(project.id, image.id, -1)
                          }
                          disabled={imageIndex === 0}
                        >
                          <FaArrowUp aria-hidden="true" /> Move up
                        </button>

                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() =>
                            moveProjectImage(project.id, image.id, 1)
                          }
                          disabled={imageIndex === images.length - 1}
                        >
                          <FaArrowDown aria-hidden="true" /> Move down
                        </button>

                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => setCoverImage(project.id, image.id)}
                        >
                          <FaStar aria-hidden="true" />{" "}
                          {image.isCover ? "Cover" : "Set cover"}
                        </button>

                        <button
                          className="danger-button"
                          type="button"
                          onClick={() =>
                            removeProjectImage(project.id, image.id)
                          }
                        >
                          <FaTrash aria-hidden="true" /> Remove image
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
