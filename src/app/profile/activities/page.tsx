export const runtime = "nodejs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getThemeByRole } from "@/lib/auth/roles";
import ActivitiesClient from "./activities-client";

function decodeToken(token: string) {
  const binary = atob(token);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

export default async function ProfileActivitiesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) redirect("/signin");

  let user;
  try {
    const decoded = decodeToken(token);
    if (Date.now() > decoded.exp) redirect("/signin");
    user = { phone: decoded.phone, username: decoded.username, role: decoded.role };
  } catch {
    redirect("/signin");
  }

  const theme = getThemeByRole(user.role);
  return <ActivitiesClient user={user} theme={theme} />;
}
