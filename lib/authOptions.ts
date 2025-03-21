import { NextAuthOptions } from "next-auth";
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          redirect_uri: "https://appcloser.xyz/api/auth/callback/google",
        },
      },
  
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/user/login',
    error: '/user/login',  // Redirect to the login page on error
  }
};
