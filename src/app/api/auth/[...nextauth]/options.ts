import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/lib/models/user";
import { comparePassword } from "@/components/utils";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "电话号码", type: "text", placeholder: "13800138000" },
        password: {
          label: "密码",
          type: "password",
          placeholder: "••••••••",
        },
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ phone: credentials?.phone });

        if (!user) {
          return null;
        }
        const isMatch = await comparePassword(
          credentials?.password || "",
          user.password,
        );

        if (!isMatch) {
          return null;
        }
        return user;

      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
};
