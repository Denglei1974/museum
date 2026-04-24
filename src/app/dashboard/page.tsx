import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeByRole, getRoleLabel, isVolunteer, isAdmin } from "@/lib/auth/roles";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const tokenValue = cookieStore.get("auth-token")?.value;

  if (!tokenValue) {
    redirect("/signin");
  }

  let user;
  try {
    user = JSON.parse(atob(tokenValue));
  } catch {
    redirect("/signin");
  }

  // 检查 token 是否过期
  if (Date.now() > (user as any).exp) {
    redirect("/signin");
  }

  const role = user.role || "social_volunteer";
  const theme = getThemeByRole(role);
  const roleLabel = getRoleLabel(role);
  const isVol = isVolunteer(role);
  const isAdm = isAdmin(role);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Header */}
      <header
        className="text-white p-4 shadow-lg"
        style={{ backgroundColor: theme.primary }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">
              🏛️ {isVol ? "志愿者服务" : "管理后台"}
            </h1>
            <p className="text-sm opacity-90">{user.username} · {roleLabel}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              退出
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto p-4">
        <DashboardClient
          user={user}
          role={role}
          theme={theme}
          isVolunteer={isVol}
          isAdmin={isAdm}
        />
      </main>
    </div>
  );
}
