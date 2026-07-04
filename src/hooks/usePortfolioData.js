import { useCallback, useEffect, useRef, useState } from "react";
import { loadRemotePortfolioData, saveRemotePortfolioData } from "../lib/portfolioApi";
import {
  clearDiscordAdminSession,
  completeDiscordLoginFromRedirect,
  getDiscordDisplayName,
  getStoredDiscordAdminSession,
  hasDiscordOAuthRedirect,
} from "../lib/discordAuth";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { loadPortfolioData, savePortfolioData } from "../lib/storage";

const INITIAL_SYNC_STATE = {
  mode: isSupabaseConfigured ? "supabase" : "local",
  loading: isSupabaseConfigured,
  saving: false,
  authenticated: false,
  adminUser: null,
  authError: "",
  error: "",
  lastSavedAt: "",
};

function toAdminUser(session) {
  if (!session?.user?.id) return null;
  return {
    discordId: session.user.id,
    name: getDiscordDisplayName(session.user),
  };
}

export function usePortfolioData() {
  const [data, setData] = useState(loadPortfolioData);
  const [sync, setSync] = useState(INITIAL_SYNC_STATE);
  const remoteLoaded = useRef(false);
  const authenticatedRef = useRef(false);

  const refreshAuthState = useCallback(async () => {
    const session = getStoredDiscordAdminSession();
    const adminUser = toAdminUser(session);
    authenticatedRef.current = Boolean(adminUser);

    setSync((current) => ({
      ...current,
      authenticated: Boolean(adminUser),
      adminUser,
      authError: "",
    }));

    return session;
  }, []);

  const logoutDiscordAdmin = useCallback(async () => {
    clearDiscordAdminSession();
    authenticatedRef.current = false;
    setSync((current) => ({
      ...current,
      authenticated: false,
      adminUser: null,
      authError: "",
    }));
  }, []);

  const reloadFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return null;

    setSync((current) => ({ ...current, loading: true, error: "" }));
    try {
      const remoteData = await loadRemotePortfolioData();
      if (remoteData) setData(remoteData);
      remoteLoaded.current = true;
      setSync((current) => ({ ...current, loading: false, error: "" }));
      return remoteData;
    } catch (error) {
      remoteLoaded.current = true;
      setSync((current) => ({
        ...current,
        loading: false,
        error: error.message || "Could not load Supabase portfolio data.",
      }));
      return null;
    }
  }, []);

  const saveToSupabaseNow = useCallback(
    async (nextData = data) => {
      if (!isSupabaseConfigured || !authenticatedRef.current) return false;

      setSync((current) => ({ ...current, saving: true, error: "" }));
      try {
        await saveRemotePortfolioData(nextData);
        const savedAt = new Date().toLocaleTimeString();
        setSync((current) => ({ ...current, saving: false, lastSavedAt: savedAt, error: "" }));
        return true;
      } catch (error) {
        setSync((current) => ({
          ...current,
          saving: false,
          error:
            error.message ||
            "Could not save portfolio data to Supabase. Check the Supabase policies in supabase/schema.sql.",
        }));
        return false;
      }
    },
    [data]
  );

  useEffect(() => {
    savePortfolioData(data);
  }, [data]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const session = hasDiscordOAuthRedirect()
          ? await completeDiscordLoginFromRedirect()
          : getStoredDiscordAdminSession();

        if (cancelled) return;

        const adminUser = toAdminUser(session);
        authenticatedRef.current = Boolean(adminUser);
        setSync((current) => ({
          ...current,
          authenticated: Boolean(adminUser),
          adminUser,
          authError: "",
        }));
      } catch (error) {
        if (cancelled) return;
        authenticatedRef.current = false;
        setSync((current) => ({
          ...current,
          authenticated: false,
          adminUser: null,
          authError: error.message || "Discord login failed.",
        }));
      }

      if (!cancelled) await reloadFromSupabase();
      if (!isSupabaseConfigured && !cancelled) {
        setSync((current) => ({ ...current, loading: false }));
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [reloadFromSupabase]);

  useEffect(() => {
    if (!isSupabaseConfigured || !remoteLoaded.current || !authenticatedRef.current) return undefined;

    const timer = window.setTimeout(() => {
      saveToSupabaseNow(data);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [data, saveToSupabaseNow]);

  return [
    data,
    setData,
    {
      ...sync,
      reloadFromSupabase,
      saveToSupabaseNow,
      refreshAuthState,
      logoutDiscordAdmin,
    },
  ];
}
