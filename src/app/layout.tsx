"use client";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/store/Auth/AuthContext";
import NavDrawer from "@/components/NavDrawer";
import Head from "next/head";
import { NavProvider } from "@/store/NavDrawer/NavContext";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <title>DiHola.Vercel.App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body className={roboto.variable}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <AuthProvider>
              <AuthGuard>
                <NavProvider>
                  <NavDrawer>{children}</NavDrawer>
                </NavProvider>
              </AuthGuard>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
