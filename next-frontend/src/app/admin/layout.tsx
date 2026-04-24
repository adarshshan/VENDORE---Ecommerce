import Sidebar from "@/src/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-grow p-4 md:p-8 overflow-x-auto">
        {children}
      </main>
    </div>
  );
}
