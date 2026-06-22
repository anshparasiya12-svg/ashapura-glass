import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => (
  <div className="min-h-screen bg-background">
    <AppSidebar />
    <main className="ml-60 min-h-screen">
      <div className="p-7 max-w-[1400px] animate-fade-in">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AppLayout;

