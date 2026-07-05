const SESSION_KEY = "genuineKiwiPortfolio:discordAdminSession:v1";
const STATE_KEY = "genuineKiwiPortfolio:discordOAuthState:v1";

export const DISCORD_CLIENT_ID =
  import.meta.env.VITE_DISCORD_CLIENT_ID || "1522861548023058643";

export const DISCORD_AUTH_SCOPES =
  import.meta.env.VITE_DISCORD_AUTH_SCOPES || "identify";

export const DISCORD_RESPONSE_TYPE =
  import.meta.env.VITE_DISCORD_RESPONSE_TYPE || "token";

export const DISCORD_API_BASE =
  import.meta.env.VITE_DISCORD_API_BASE || "https://discord.com/api";

export const ALLOWED_DISCORD_ADMIN_IDS = (
  import.meta.env.VITE_DISCORD_ADMIN_IDS ||
  "816509777911742486,972599697229365278"
)
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

function getBrowserOrigin() {
  if (typeof window === "undefined") return "http://localhost:5173";
  return window.location.origin;
}

export function getDiscordRedirectUri() {
  /*
    Use the current origin instead of a hardcoded env redirect.
    This lets Discord login work on:
    - https://genuine-kiwi.vercel.app
    - https://genuinekiwi.website
    - https://www.genuinekiwi.website

    Make sure each origin is listed in Discord Developer Portal → OAuth2 → Redirects.
  */
  return getBrowserOrigin();
}

function createState() {
  const randomPart =
    globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);

  const state = `admin-${Date.now()}-${randomPart}`;

  try {
    sessionStorage.setItem(STATE_KEY, state);
    localStorage.setItem(STATE_KEY, state);
  } catch {
    localStorage.setItem(STATE_KEY, state);
  }

  return state;
}

function getStoredState() {
  try {
    return (
      sessionStorage.getItem(STATE_KEY) || localStorage.getItem(STATE_KEY) || ""
    );
  } catch {
    return localStorage.getItem(STATE_KEY) || "";
  }
}

function clearStoredState() {
  try {
    sessionStorage.removeItem(STATE_KEY);
    localStorage.removeItem(STATE_KEY);
  } catch {
    localStorage.removeItem(STATE_KEY);
  }
}

export function getDiscordAuthorizeUrl(state = "") {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    response_type: DISCORD_RESPONSE_TYPE,
    redirect_uri: getDiscordRedirectUri(),
    scope: DISCORD_AUTH_SCOPES,
  });

  if (state) params.set("state", state);

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export function beginDiscordLogin() {
  const state = createState();
  window.location.assign(getDiscordAuthorizeUrl(state));
}

function parseOAuthFragment() {
  if (typeof window === "undefined") return null;

  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) return null;

  /*
    Normal Discord implicit redirect:
    #access_token=...&token_type=Bearer...

    Also tolerate hash-route variants:
    #admin&access_token=...
    #admin?access_token=...
    #/admin&access_token=...
    #/admin?access_token=...
  */
  const cleaned = rawHash.replace(/^admin[?&]/, "").replace(/^\/admin[?&]/, "");

  if (!cleaned.includes("access_token=")) return null;

  return new URLSearchParams(cleaned);
}

function parseOAuthError() {
  if (typeof window === "undefined") return "";

  const rawHash = window.location.hash.replace(/^#/, "");
  const rawSearch = window.location.search.replace(/^\?/, "");

  const possible = [rawHash, rawSearch]
    .map((value) => value.replace(/^admin[?&]/, "").replace(/^\/admin[?&]/, ""))
    .filter(Boolean);

  for (const item of possible) {
    const params = new URLSearchParams(item);
    if (params.get("error")) {
      return params.get("error_description") || params.get("error");
    }
  }

  return "";
}

export function hasDiscordOAuthRedirect() {
  return Boolean(parseOAuthFragment() || parseOAuthError());
}

function cleanAdminUrl() {
  if (typeof window === "undefined") return;

  window.history.replaceState(null, "", `${window.location.pathname}#admin`);

  try {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } catch {
    window.dispatchEvent(new Event("hashchange"));
  }
}

export function clearDiscordAdminSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getStoredDiscordAdminSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

    if (!stored?.accessToken || !stored?.user?.id || !stored?.expiresAt) {
      return null;
    }

    if (Date.now() >= stored.expiresAt) {
      clearDiscordAdminSession();
      return null;
    }

    if (!ALLOWED_DISCORD_ADMIN_IDS.includes(String(stored.user.id))) {
      clearDiscordAdminSession();
      return null;
    }

    return stored;
  } catch {
    clearDiscordAdminSession();
    return null;
  }
}

export function getDiscordDisplayName(user) {
  if (!user) return "Discord admin";
  return user.global_name || user.username || "Discord admin";
}

export async function fetchDiscordCurrentUser(
  accessToken,
  tokenType = "Bearer",
) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `${tokenType} ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Discord rejected the OAuth token. Try logging in again.");
  }

  return response.json();
}

export async function completeDiscordLoginFromRedirect() {
  const oauthError = parseOAuthError();

  if (oauthError) {
    cleanAdminUrl();
    throw new Error(oauthError);
  }

  const params = parseOAuthFragment();

  if (!params) {
    return getStoredDiscordAdminSession();
  }

  const accessToken = params.get("access_token");
  const tokenType = params.get("token_type") || "Bearer";
  const expiresIn = Number(params.get("expires_in") || "604800");
  const returnedState = params.get("state") || "";
  const expectedState = getStoredState();

  clearStoredState();

  if (!accessToken) {
    cleanAdminUrl();
    throw new Error("Discord did not return an access token.");
  }

  if (!returnedState) {
    cleanAdminUrl();
    throw new Error("Discord did not return a login state. Try again.");
  }

  if (!expectedState) {
    cleanAdminUrl();
    throw new Error(
      "Discord login state was missing in this browser. Try again from the same tab.",
    );
  }

  if (expectedState !== returnedState) {
    cleanAdminUrl();
    throw new Error("Discord login state did not match. Try again.");
  }

  const user = await fetchDiscordCurrentUser(accessToken, tokenType);
  const discordId = String(user.id || "");

  if (!ALLOWED_DISCORD_ADMIN_IDS.includes(discordId)) {
    cleanAdminUrl();
    clearDiscordAdminSession();
    throw new Error(
      `Discord account ${discordId || "unknown"} is not allowed to use this admin area.`,
    );
  }

  const session = {
    accessToken,
    tokenType,
    expiresAt: Date.now() + Math.max(expiresIn - 60, 60) * 1000,
    user: {
      id: discordId,
      username: user.username || "",
      global_name: user.global_name || "",
      avatar: user.avatar || "",
    },
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  cleanAdminUrl();

  return session;
}
