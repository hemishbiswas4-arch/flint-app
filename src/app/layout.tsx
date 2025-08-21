// Location: src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers"; // <-- IMPORT THE NEW PROVIDER

export const metadata: Metadata = {
  title: "Outplann",
  description: "Spark your next adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className="h-screen w-screen overflow-hidden bg-[#0c0a09]">
          <Providers>{children}</Providers>
        </body>
    </html>
  );
}