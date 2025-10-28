import { requireAuth } from "@/lib/auth";
import { NavHeader } from "@/components/nav-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-background">
      <NavHeader userName={user.name} />
      {children}
    </div>
  );
}
