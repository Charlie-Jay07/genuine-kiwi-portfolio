export const DEFAULT_DISCORD_PROFILE_URL =
  import.meta.env.VITE_PUBLIC_DISCORD_PROFILE_URL || "https://discord.com/users/816509777911742486";

export const DEFAULT_ROBLOX_PROFILE_URL =
  import.meta.env.VITE_PUBLIC_ROBLOX_PROFILE_URL || "https://www.roblox.com/users/1939978392/profile";

function byLabel(data, label) {
  const target = label.toLowerCase();
  return data?.socials?.find((social) => social.label?.toLowerCase().includes(target));
}

export function getDiscordProfileHref(data) {
  return data?.profile?.discordProfileUrl || byLabel(data, "discord")?.href || DEFAULT_DISCORD_PROFILE_URL;
}

export function getRobloxProfileHref(data) {
  return data?.profile?.robloxProfileUrl || byLabel(data, "roblox")?.href || DEFAULT_ROBLOX_PROFILE_URL;
}

export function getSocialHref(data, social) {
  if (social?.href) return social.href;

  const label = social?.label?.toLowerCase() || "";
  if (label.includes("discord")) return getDiscordProfileHref(data);
  if (label.includes("roblox")) return getRobloxProfileHref(data);
  return "";
}
