import { Field } from "../../components/ui/Field";
import { createId } from "../../lib/storage";
import { toTitle } from "../../lib/format";

export function ProfileEditor({ data, setData }) {
  const profileFields = [
    "brand",
    "displayName",
    "role",
    "headline",
    "about",
    "discord",
    "discordProfileUrl",
    "robloxUsername",
    "robloxProfileUrl",
    "location",
    "availability",
    "logoImage",
    "avatarImage",
    "heroImage",
  ];

  function updateProfile(field, value) {
    setData((current) => ({ ...current, profile: { ...current.profile, [field]: value } }));
  }

  function updateStat(id, field, value) {
    setData((current) => ({
      ...current,
      stats: current.stats.map((stat) => (stat.id === id ? { ...stat, [field]: value } : stat)),
    }));
  }

  function addStat() {
    setData((current) => ({
      ...current,
      stats: [...current.stats, { id: createId("stat"), value: "New", label: "Stat label" }],
    }));
  }

  function removeStat(id) {
    setData((current) => ({ ...current, stats: current.stats.filter((stat) => stat.id !== id) }));
  }

  return (
    <div className="editor-stack">
      <h2>Profile</h2>
      <div className="form-grid">
        {profileFields.map((field) => (
          <Field
            key={field}
            label={toTitle(field)}
            value={data.profile[field] || ""}
            multiline={field === "about" || field === "headline"}
            onChange={(value) => updateProfile(field, value)}
          />
        ))}
      </div>
      <div className="editor-heading-row">
        <h3>Stats</h3>
        <button className="ghost-button" onClick={addStat}>Add stat</button>
      </div>
      <div className="admin-list">
        {data.stats.map((stat) => (
          <div className="admin-item" key={stat.id}>
            <Field label="Value" value={stat.value} onChange={(value) => updateStat(stat.id, "value", value)} />
            <Field label="Label" value={stat.label} onChange={(value) => updateStat(stat.id, "label", value)} />
            <button className="danger-button" onClick={() => removeStat(stat.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
