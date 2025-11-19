// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          // IMPORTANTE: incluir Mail.Send
          scope:
            "openid profile email offline_access https://graph.microsoft.com/Mail.Send",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Primera vez que se loguea en la sesión
      if (account) {
        token.accessToken = account.access_token || null;
        token.refreshToken = account.refresh_token || null;
      }
      return token;
    },
    async session({ session, token }) {
      // Exponemos el accessToken al frontend
      session.user.accessToken = token.accessToken || null;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
