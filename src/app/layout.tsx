import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "CONTENT – platforma barterowa",
  description: "Połącz restaurację z twórcami treści. Barter jedzenie za content.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://content-prod.vercel.app"),
  openGraph: {
    title: "CONTENT – platforma barterowa",
    description: "Połącz restaurację z twórcami treści",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${inter.className} antialiased`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
