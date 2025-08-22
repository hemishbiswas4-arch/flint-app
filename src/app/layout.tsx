import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers"; // Should have curly braces {}

export const metadata: Metadata = {
  title: "Outplann",
  description: "Spark your next adventure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}