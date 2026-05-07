import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeByRole } from "@/lib/auth/roles";
import SignupClient from "./signup-client";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const tokenValue = cookieStore.get("auth-token")?.value;
  if (!tokenValue) redirect("/signin");

  let user;
  try {
    user = JSON.parse(atob(tokenValue));
  } catch {
    redirect("/signin");
  }
  if (Date.now() > (user as any).exp) redirect("/signin");

  const { id } = await params;
  const theme = getThemeByRole(user.role);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bg }}>
      <main className="flex-1 max-w-lg mx-auto w-full p-4 pb-20">
        <SignupClient user={user} recruitmentId={id} theme={theme} />
      </main>
    </div>
  );
}
