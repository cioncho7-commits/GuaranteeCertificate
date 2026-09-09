import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, Kakao, Naver],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // 이메일을 사용자 식별자로 사용 (모바일 앱 로그인과 동일한 기준)
        (session.user as { id?: string }).id =
          session.user.email ?? (token.sub as string | undefined);
      }
      return session;
    },
  },
});
