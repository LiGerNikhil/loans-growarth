import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase();
        const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rateKey = `${ip}:${email}`;

        const { allowed } = checkRateLimit(rateKey);
        if (!allowed) {
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        await dbConnect();

        const user = await User.findOne({ email });
        if (!user) return null;

        if (!user.active) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) {
          await Activity.create({
            actionType: "LOGIN_FAILED",
            performedBy: user._id,
            description: `Failed login attempt for ${email} from IP ${ip}`,
          });
          return null;
        }

        resetRateLimit(rateKey);

        await Activity.create({
          actionType: "LOGIN_SUCCESS",
          performedBy: user._id,
          description: `Successful login by ${email} from IP ${ip}`,
        });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin/login")) return true;
      if (pathname.startsWith("/api/auth")) return true;
      return !!auth?.user;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role as string;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },
  trustHost: true,
});
