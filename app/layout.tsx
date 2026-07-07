import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

const fontDisplay = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const fontBody = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trip Expense Tracker",
  description: "Track shared trip expenses and settle up with family",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {user && (
          <header className="flex items-center justify-between border-b border-primary/10 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 px-4 py-3">
            <span className="font-heading text-lg font-semibold tracking-tight text-primary">
              Trip Expense Tracker
            </span>
            <LogoutButton />
          </header>
        )}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
