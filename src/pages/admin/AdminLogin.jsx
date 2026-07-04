import { useMemo, useState } from "react";
import { FaCopy, FaDiscord, FaExternalLinkAlt, FaLock, FaUserShield } from "react-icons/fa";
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
    []
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
        <p className="eyebrow"><FaUserShield aria-hidden="true" /> Admin</p>
        <h1>Discord admin login</h1>
        <p>
          Admin editing uses Discord OAuth directly. Supabase is only used for portfolio content storage when configured.
        </p>

        <div className="allowed-admins">
          <span><FaLock aria-hidden="true" /> Allowed Discord IDs</span>
          {ALLOWED_DISCORD_ADMIN_IDS.map((id) => <code key={id}>{id}</code>)}
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-button discord-button" type="button" onClick={beginDiscordLogin}>
          <FaDiscord aria-hidden="true" />
          Continue with Discord
        </button>

        {!isSupabaseConfigured && (
          <p className="form-note">
            Supabase is not configured yet, so admin edits will still save in this browser locally. Add Supabase env keys to sync content across devices.
          </p>
        )}

        <section className="oauth-setup-panel" aria-label="Discord OAuth setup values">
          <h2>Discord OAuth setup values</h2>
          <p>
            Add the redirect URL below in Discord Developer Portal. This version does not use Supabase Auth.
          </p>

          <div className="oauth-row">
            <span>Discord client ID</span>
            <code>{setupValues.clientId}</code>
            <button type="button" onClick={() => copyValue("Discord client ID", setupValues.clientId)}><FaCopy aria-hidden="true" /> Copy</button>
          </div>

          <div className="oauth-row">
            <span>Discord redirect URL</span>
            <code>{setupValues.redirectUri}</code>
            <button type="button" onClick={() => copyValue("Discord redirect URL", setupValues.redirectUri)}><FaCopy aria-hidden="true" /> Copy</button>
          </div>

          <div className="oauth-row">
            <span>Response type</span>
            <code>{setupValues.responseType}</code>
            <button type="button" onClick={() => copyValue("Response type", setupValues.responseType)}><FaCopy aria-hidden="true" /> Copy</button>
          </div>

          <div className="oauth-row">
            <span>Scopes</span>
            <code>{DISCORD_AUTH_SCOPES}</code>
            <button type="button" onClick={() => copyValue("Scopes", DISCORD_AUTH_SCOPES)}><FaCopy aria-hidden="true" /> Copy</button>
          </div>

          <div className="oauth-row muted-oauth-row">
            <span>Direct Discord OAuth URL</span>
            <code>{setupValues.oauthUrl}</code>
            <button type="button" onClick={() => copyValue("Direct Discord OAuth URL", setupValues.oauthUrl)}><FaCopy aria-hidden="true" /> Copy</button>
          </div>

          {copied && <p className="form-note">{copied}</p>}

          <a className="text-link" href="https://discord.com/developers/applications" target="_blank" rel="noreferrer">
            Open Discord Developer Portal <FaExternalLinkAlt aria-hidden="true" />
          </a>
        </section>
      </div>
    </main>
  );
}
