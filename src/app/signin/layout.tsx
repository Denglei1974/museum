import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SigninLayout(props: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (token) {
    redirect("/dashboard");
  }
  return <>{props.children}</>;
}
