import { useState } from "react";
import { FaDownload, FaImages, FaLink, FaListUl, FaSave, FaSignOutAlt, FaSyncAlt, FaTags, FaTools, FaUndo, FaUserCircle } from "react-icons/fa";
import { DEFAULT_DATA } from "../../data/defaultData";
import { AdminLogin } from "./AdminLogin";
import { PricingEditor } from "./PricingEditor";
import { ProfileEditor } from "./ProfileEditor";
import { ProjectsEditor } from "./ProjectsEditor";
import { SimpleListEditor } from "./SimpleListEditor";

const tabs = [
  { id: "profile", label: "Profile", icon: FaUserCircle },
  { id: "projects", label: "Projects", icon: FaImages },
  { id: "pricing", label: "Pricing", icon: FaTags },
  { id: "guidelines", label: "Guidelines", icon: FaListUl },
  { id: "services", label: "Services", icon: FaTools },
  { id: "socials", label: "Socials", icon: FaLink },
];

export function AdminPage({ data, setData, sync }) {
  const [activeTab, setActiveTab] = useState("profile");
  const session = Boolean(sync.authenticated);

  if (!session) {
    return <AdminLogin error={sync.authError || sync.error} />;
  }

  function resetData() {
    const shouldReset = window.confirm("Reset the editor to the bundled demo content? This will autosave if Supabase is connected.");
    if (shouldReset) setData(DEFAULT_DATA);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "genuine-kiwi-portfolio-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="admin section-pad page-section">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin area</p>
          <h1>Edit portfolio content</h1>
          <p>
            Direct Discord OAuth admin access is active. Text changes autosave to Supabase content storage, and project image uploads use Supabase Storage.
          </p>
          <div className="sync-status" aria-live="polite">
            <span>Mode: Discord OAuth + portfolio storage</span>
            {sync.adminUser?.name && <span>Signed in: {sync.adminUser.name}</span>}
            {sync.adminUser?.discordId && <span>Discord ID: {sync.adminUser.discordId}</span>}
            {sync.loading && <span>Loading remote data...</span>}
            {sync.saving && <span>Saving...</span>}
            {sync.lastSavedAt && <span>Last saved: {sync.lastSavedAt}</span>}
            {sync.error && <strong>{sync.error}</strong>}
          </div>
        </div>
        <div className="admin-actions">
          <button className="ghost-button" onClick={sync.reloadFromSupabase}><FaSyncAlt aria-hidden="true" /> Reload</button>
          <button className="primary-button" onClick={() => sync.saveToSupabaseNow(data)}><FaSave aria-hidden="true" /> Save now</button>
          <button className="ghost-button" onClick={exportData}><FaDownload aria-hidden="true" /> Export backup</button>
          <button className="ghost-button" onClick={resetData}><FaUndo aria-hidden="true" /> Reset demo data</button>
          <button className="ghost-button" onClick={sync.logoutDiscordAdmin}><FaSignOutAlt aria-hidden="true" /> Log out</button>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="admin-tabs" aria-label="Admin sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
                <span className="admin-tab-icon"><Icon aria-hidden="true" /></span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        <section className="admin-workspace glass-card">
          {activeTab === "profile" && <ProfileEditor data={data} setData={setData} />}
          {activeTab === "projects" && <ProjectsEditor data={data} setData={setData} />}
          {activeTab === "pricing" && <PricingEditor data={data} setData={setData} />}
          {activeTab === "guidelines" && <SimpleListEditor title="Guidelines" collection="guidelines" fields={["text"]} data={data} setData={setData} />}
          {activeTab === "services" && <SimpleListEditor title="Services" collection="services" fields={["title", "description"]} data={data} setData={setData} />}
          {activeTab === "socials" && <SimpleListEditor title="Social links" collection="socials" fields={["label", "value", "href"]} data={data} setData={setData} />}
        </section>
      </div>
    </main>
  );
}
