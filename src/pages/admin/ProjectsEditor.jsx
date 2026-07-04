import { useRef, useState } from "react";
import { FaCloudUploadAlt, FaImages, FaPlus, FaStar, FaTrash } from "react-icons/fa";
import { Field } from "../../components/ui/Field";
import { deletePortfolioImage, isSupabaseStorageReady, uploadPortfolioImage } from "../../lib/portfolioApi";
import { getProjectCover } from "../../lib/projectMedia";
import { createId } from "../../lib/storage";

function ensureProjectImages(project) {
  if (Array.isArray(project.images) && project.images.length) return project.images;
  if (!project.image) return [];

  return [
    {
      id: `${project.id}-image-1`,
      title: project.title || "Project image",
      image: project.image,
      path: project.imagePath || "",
      description: project.description || "",
      isCover: true,
    },
  ];
}

function stripFileExtension(fileName = "Project image") {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Project image";
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
          return {
            ...project,
            image: value,
            images: hasImages
              ? images.map((image, index) =>
                  image.isCover || (!images.some((item) => item.isCover) && index === 0) ? { ...image, image: value, isCover: true } : image
                )
              : [],
          };
        }

        return { ...project, [field]: value };
      }),
    }));
  }

  function updateProjectImage(projectId, imageId, field, value) {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== projectId) return project;
        const images = ensureProjectImages(project).map((image) => (image.id === imageId ? { ...image, [field]: value } : image));
        const cover = images.find((image) => image.isCover) || images[0];
        return {
          ...project,
          image: cover?.image || project.image || "",
          images,
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
          images: [],
        },
        ...current.projects,
      ],
    }));
    setUploadStatus((current) => ({ ...current, [id]: "Collection created. Drag images into it or use Upload images." }));
  }

  async function removeProject(id) {
    const project = data.projects.find((item) => item.id === id);
    const shouldRemove = window.confirm(`Remove ${project?.title || "this project"}?`);
    if (!shouldRemove) return;

    setData((current) => ({ ...current, projects: current.projects.filter((projectItem) => projectItem.id !== id) }));
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
        };
        const nextImages = [...images, nextImage];
        return {
          ...project,
          image: project.image || nextImage.image,
          images: nextImages,
        };
      }),
    }));
  }

  async function removeProjectImage(projectId, imageId) {
    const project = data.projects.find((item) => item.id === projectId);
    const image = ensureProjectImages(project).find((item) => item.id === imageId);
    const shouldRemove = window.confirm(`Remove ${image?.title || "this image"}?`);
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
        const remaining = ensureProjectImages(projectItem).filter((item) => item.id !== imageId);
        const hasCover = remaining.some((item) => item.isCover);
        const nextImages = remaining.map((item, index) => ({ ...item, isCover: hasCover ? item.isCover : index === 0 }));
        const cover = nextImages.find((item) => item.isCover) || nextImages[0];
        return {
          ...projectItem,
          image: cover?.image || "",
          images: nextImages,
        };
      }),
    }));
  }

  function setCoverImage(projectId, imageId) {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== projectId) return project;
        const images = ensureProjectImages(project).map((image) => ({ ...image, isCover: image.id === imageId }));
        const cover = images.find((image) => image.id === imageId);
        return {
          ...project,
          image: cover?.image || project.image || "",
          images,
        };
      }),
    }));
  }

  async function uploadFiles(project, fileList) {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;

    if (!storageReady) {
      setUploadStatus((current) => ({
        ...current,
        [project.id]: "Supabase Storage is not configured. Add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and run supabase/schema.sql.",
      }));
      return;
    }

    setUploadStatus((current) => ({ ...current, [project.id]: `Uploading ${files.length} image${files.length === 1 ? "" : "s"}...` }));

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
        });
      }

      setData((current) => ({
        ...current,
        projects: current.projects.map((projectItem) => {
          if (projectItem.id !== project.id) return projectItem;
          const existingImages = ensureProjectImages(projectItem).filter((image) => image.image);
          const shouldMarkFirstUploadAsCover = existingImages.length === 0;
          const nextUploaded = uploadedImages.map((image, index) => ({
            ...image,
            isCover: shouldMarkFirstUploadAsCover && index === 0,
          }));
          const nextImages = [...existingImages, ...nextUploaded];
          const cover = nextImages.find((image) => image.isCover) || nextImages[0];
          return {
            ...projectItem,
            image: cover?.image || "",
            images: nextImages,
          };
        }),
      }));

      setUploadStatus((current) => ({ ...current, [project.id]: "Upload complete. The collection will autosave to Supabase." }));
    } catch (error) {
      setUploadStatus((current) => ({
        ...current,
        [project.id]: error.message || "Upload failed. Check the Supabase Storage bucket and policies.",
      }));
    }
  }

  return (
    <div className="editor-stack">
      <div className="editor-heading-row">
        <div>
          <h2>Projects</h2>
          <p className="form-note">Each project is a portfolio collection. Add multiple images to one build and write descriptions per image.</p>
        </div>
        <button className="ghost-button" type="button" onClick={addProject}>
          <FaPlus aria-hidden="true" /> Add project
        </button>
      </div>

      {!storageReady && (
        <p className="form-error">
          Supabase Storage is not ready. Image drag/drop uploads need Supabase env values and the Storage bucket from supabase/schema.sql.
        </p>
      )}

      <div className="admin-list">
        {data.projects.map((project) => {
          const images = ensureProjectImages(project);
          const cover = getProjectCover(project);
          return (
            <div className="admin-item project-editor collection-editor" key={project.id}>
              <div className="project-collection-toolbar">
                <div>
                  <span>Portfolio collection</span>
                  <h3>{project.title || "Untitled project"}</h3>
                </div>
                <button className="danger-button project-remove-button" type="button" onClick={() => removeProject(project.id)}>
                  <FaTrash aria-hidden="true" /> Remove project
                </button>
              </div>

              <div className="project-cover-preview">
                {cover ? <img src={cover} alt="" /> : <div className="empty-cover"><FaImages aria-hidden="true" /> No cover yet</div>}
                <span>{images.length} image{images.length === 1 ? "" : "s"}</span>
              </div>

              <div className="project-editor-main">
                <div className="form-grid project-details-grid">
                  <Field label="Collection / project title" value={project.title} onChange={(value) => updateProject(project.id, "title", value)} />
                  <Field label="Category" value={project.category} onChange={(value) => updateProject(project.id, "category", value)} />
                  <Field label="Main description" value={project.description} multiline onChange={(value) => updateProject(project.id, "description", value)} />
                  <Field label="Cover image URL" value={project.image || ""} onChange={(value) => updateProject(project.id, "image", value)} />
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
                    <span>Uploads go to the Supabase Storage bucket, then save into this collection.</span>
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

                {uploadStatus[project.id] && <p className="form-note">{uploadStatus[project.id]}</p>}

                <div className="collection-images-header">
                  <h3>Collection images</h3>
                  <button className="ghost-button" type="button" onClick={() => addManualImage(project.id)}>
                    <FaPlus aria-hidden="true" /> Add image manually
                  </button>
                </div>

                <div className="collection-image-list">
                  {images.length === 0 && <p className="form-note">No images in this collection yet. Upload images to Supabase Storage above.</p>}
                  {images.map((image) => (
                    <div className="collection-image-editor" key={image.id}>
                      <div className="collection-image-thumb">
                        {image.image ? <img src={image.image} alt="" /> : <div>No image</div>}
                      </div>
                      <div className="form-grid collection-image-fields">
                        <Field label="Image title" value={image.title || ""} onChange={(value) => updateProjectImage(project.id, image.id, "title", value)} />
                        <Field label="Image URL" value={image.image || ""} onChange={(value) => updateProjectImage(project.id, image.id, "image", value)} />
                        <Field label="Image description" value={image.description || ""} multiline onChange={(value) => updateProjectImage(project.id, image.id, "description", value)} />
                        <Field label="Supabase path" value={image.path || ""} onChange={(value) => updateProjectImage(project.id, image.id, "path", value)} />
                      </div>
                      <div className="collection-image-actions">
                        <button className="ghost-button" type="button" onClick={() => setCoverImage(project.id, image.id)}>
                          <FaStar aria-hidden="true" /> {image.isCover ? "Cover" : "Set cover"}
                        </button>
                        <button className="danger-button" type="button" onClick={() => removeProjectImage(project.id, image.id)}>
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
