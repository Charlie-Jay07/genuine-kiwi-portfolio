import { DEFAULT_DATA } from "../data/defaultData";
import { mergeDefaults } from "./storage";
import { isSupabaseConfigured, PORTFOLIO_ROW_ID, PORTFOLIO_STORAGE_BUCKET, supabase } from "./supabaseClient";

export async function loadRemotePortfolioData() {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from("portfolio_content")
    .select("data")
    .eq("id", PORTFOLIO_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data?.data) return null;
  return mergeDefaults(DEFAULT_DATA, data.data);
}

export async function saveRemotePortfolioData(nextData) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { error } = await supabase.from("portfolio_content").upsert({
    id: PORTFOLIO_ROW_ID,
    data: nextData,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  return true;
}


function cleanFileName(name = "image") {
  const fallback = "portfolio-image";
  const safeName = String(name || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return safeName || fallback;
}

function getRandomId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isSupabaseStorageReady() {
  return Boolean(isSupabaseConfigured && supabase);
}

export async function uploadPortfolioImage(file, projectId = "project") {
  if (!isSupabaseStorageReady()) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local first.");
  }

  if (!file || !file.type?.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  const safeProjectId = cleanFileName(projectId);
  const filePath = `projects/${safeProjectId}/${getRandomId()}-${cleanFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from(PORTFOLIO_STORAGE_BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(PORTFOLIO_STORAGE_BUCKET).getPublicUrl(filePath);

  return {
    path: filePath,
    url: data.publicUrl,
  };
}

export async function deletePortfolioImage(path) {
  if (!path || !isSupabaseStorageReady()) return false;

  const { error } = await supabase.storage.from(PORTFOLIO_STORAGE_BUCKET).remove([path]);
  if (error) throw error;
  return true;
}
