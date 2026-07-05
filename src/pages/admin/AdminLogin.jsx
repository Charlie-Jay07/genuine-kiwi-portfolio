import { useMemo, useState } from "react";
import {
  FaCopy,
  FaDiscord,
  FaExternalLinkAlt,
  FaLock,
  FaUserShield,
} from "react-icons/fa";
import {
  ALLOWED_DISCORD_ADMIN_IDS,
  DISCORD_AUTH_SCOPES,
  DISCORD_CLIENT_ID,
  DISCORD_RESPONSE_TYPE,
  beginDiscordLogin,
  getDiscordAuthorizeUrl,
  getDiscordRedirectUri,
} from "../../lib/discordAuth";
import { isSupabaseConfigured } from "../../lib/supabaseClient";

export function AdminLogin({ error }) {
  const [copied, setCopied] = useState("");

  const setupValues = useMemo(
    () => ({
      redirectUri: getDiscordRedirectUri(),
      oauthUrl: getDiscordAuthorizeUrl("generated-when-button-is-clicked"),
      clientId: DISCORD_CLIENT_ID,
      responseType: DISCORD_RESPONSE_TYPE,
    }),
    [],
  );

  async function copyValue(label, value) {
    setCopied("");

    try {
      await navigator.clipboard.writeText(value);
      setCopied(`${label} copied`);
    } catch {
      setCopied("Could not copy. Select the text manually.");
    }
  }

  return (
    <main className="admin-login section-pad page-section">
      <div className="login-card glass-card">
        <p className="eyebrow">
          <FaUserShield aria-hidden="true" /> Admin
        </p>
        <h1>Login</h1>

        {error && <p className="form-error">{error}</p>}

        <button
          className="primary-button discord-button"
          type="button"
          onClick={beginDiscordLogin}
        >
          <FaDiscord aria-hidden="true" />
          Continue with Discord
        </button>

        {!isSupabaseConfigured && (
          <p className="form-note">
            Supabase is not configured yet, so admin edits will still save in
            this browser locally. Add Supabase env keys to sync content across
            devices.
          </p>
        )}
      </div>
    </main>
  );
}
