import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeByRole } from "@/lib/auth/roles";
import AdminCheckinsClient from "./admin-checkins-client";

export default async function AdminCheckinsPage() {
  const cookieStore = await cookies();
  const tokenValue = cookieStore.get("auth-token")?.value;
  if (!tokenValue) redirect("/signin");

  let user;
  try { user = JSON.parse(atob(tokenValue)); } catch { redirect("/signin"); }
  if (Date.now() > (user as any).exp) redirect("/signin");

  const theme = getThemeByRole(user.role);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      <header className="text-white p-4 shadow-lg" style={{ backgroundColor: theme.primary }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/dashboard" className="text-xl">←</a>
          <h1 className="text-lg font-bold">签到管理</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        <AdminCheckinsClient theme={theme} />
      </main>
    </div>
  );
}
