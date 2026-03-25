import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-grow p-4 md:p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
