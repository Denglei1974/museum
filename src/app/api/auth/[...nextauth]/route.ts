import NextAuth from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
const handle = NextAuth(authOptions);

export { handle as GET, handle as POST };
