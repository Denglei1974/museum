import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeByRole, getRoleLabel, isVolunteer, isAdmin } from "@/lib/auth/roles";
import VolunteerHome from "./volunteer-home";

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

  // 管理员 → 跳转到管理后台
  if (isAdmin(role)) {
    redirect("/admin/volunteers");
  }

  // 志愿者 → 显示志愿者主页
  const theme = getThemeByRole(role);
  const roleLabel = getRoleLabel(role);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      <VolunteerHome
        user={user}
        role={role}
        roleLabel={roleLabel}
        theme={theme}
      />
    </div>
  );
}
