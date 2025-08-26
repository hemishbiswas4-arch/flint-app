import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import ClientLayout from "@/app/client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Outplann - AI Itinerary Generator",
  description: "Your AI-powered trip planner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ✅ Client wrapper handles auth + header */}
        <ClientLayout>{children}</ClientLayout>
        <Toaster richColors />
      </body>
    </html>
  );
}
