import { SiteLayout } from "./components/layout/SiteLayout";
import { useHashRoute } from "./hooks/useHashRoute";
import { usePortfolioData } from "./hooks/usePortfolioData";
import { AdminPage } from "./pages/admin/AdminPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { PricingPage } from "./pages/PricingPage";
import { ServicesPage } from "./pages/ServicesPage";
import { WorkPage } from "./pages/WorkPage";

function App() {
  const [data, setData, sync] = usePortfolioData();
  const route = useHashRoute();

  return (
    <SiteLayout data={data} route={route}>
      {route === "home" && <HomePage data={data} />}
      {route === "work" && <WorkPage projects={data.projects} />}
      {route === "services" && <ServicesPage services={data.services} />}
      {route === "pricing" && <PricingPage pricing={data.pricing} guidelines={data.guidelines} />}
      {route === "contact" && <ContactPage data={data} />}
      {route === "admin" && <AdminPage data={data} setData={setData} sync={sync} />}
    </SiteLayout>
  );
}

export default App;
