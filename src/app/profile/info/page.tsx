export const runtime = "nodejs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import InfoClient from "./info-client";

function decodeToken(token: string) {
  const binary = atob(token);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

export default async function ProfileInfoPage() {
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

  const theme = { primary: "#2196F3", bg: "#F5F7FA", accent: "#4CAF50" };
  return <InfoClient user={user} theme={theme} />;
}
