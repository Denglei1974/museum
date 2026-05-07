import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeByRole, isVolunteer, isAdmin } from "@/lib/auth/roles";
import RecruitClient from "./recruit-client";
import VolunteerNav from "@/components/nav/volunteer-nav";

export default async function RecruitPage() {
  const cookieStore = await cookies();
  const tokenValue = cookieStore.get("auth-token")?.value;
  if (!tokenValue) redirect("/signin");

  let user;
  try { user = JSON.parse(atob(tokenValue)); } catch { redirect("/signin"); }
  if (Date.now() > (user as any).exp) redirect("/signin");

  const theme = getThemeByRole(user.role);
  const isVol = isVolunteer(user.role);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bg }}>
      <header className="text-white p-4 shadow-lg shrink-0" style={{ backgroundColor: theme.primary }}>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <a href="/dashboard" className="text-xl">←</a>
          <h1 className="text-lg font-bold">招募活动</h1>
        </div>
      </header>
      <main className="flex-1 max-w-lg mx-auto w-full p-4 pb-20">
        <RecruitClient user={user} isVolunteer={isVol} theme={theme} />
      </main>
      <VolunteerNav theme={theme} />
    </div>
  );
}
