// Location: src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers"; // <-- IMPORT THE NEW PROVIDER

export const metadata: Metadata = {
  title: "Flint",
  description: "Spark your next adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* WRAP YOUR APP WITH THE PROVIDER */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}