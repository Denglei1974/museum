import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeByRole } from "@/lib/auth/roles";
import ResultClient from "./result-client";

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; reason?: string }>;
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
  const { status, reason } = await searchParams;
  const theme = getThemeByRole(user.role);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f0f7e8" }}>
      <main className="flex-1 max-w-lg mx-auto w-full p-4 pb-20">
        <ResultClient
          recruitmentId={id}
          status={status === "success" ? "success" : "failure"}
          reason={reason || ""}
          theme={theme}
        />
      </main>
    </div>
  );
}
