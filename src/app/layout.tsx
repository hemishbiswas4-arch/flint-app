import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from "sonner"; // FIX: Changed path from "@/components/ui/sonner"

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Outplann - AI Itinerary Generator',
  description: 'Your AI-powered trip planner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}