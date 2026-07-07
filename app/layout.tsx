import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Frank_Ruhl_Libre, Heebo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LogoutButton } from "@/components/logout-button";
import { LocaleProvider } from "@/components/i18n-provider";
import { createClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

const fontDisplay = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const fontBody = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const fontDisplayHe = Frank_Ruhl_Libre({
  variable: "--font-display-he",
  subsets: ["hebrew", "latin"],
});

const fontBodyHe = Heebo({
  variable: "--font-body-he",
  subsets: ["hebrew", "latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const locale = await getServerLocale(supabase);
  const dict = getDictionary(locale);

  return {
    title: dict.brand,
    description: dict.appDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const locale = await getServerLocale(supabase);
  const dict = getDictionary(locale);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang={locale}
      dir={locale === "he" ? "rtl" : "ltr"}
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontDisplayHe.variable} ${fontBodyHe.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={locale}>
          {user && (
            <header className="flex items-center justify-between border-b border-primary/10 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 px-4 py-3">
              <span className="font-sans text-lg font-semibold text-primary">
                {dict.brand}
              </span>
              <LogoutButton />
            </header>
          )}
          {children}
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
