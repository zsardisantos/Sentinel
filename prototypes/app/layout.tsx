import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sentinel | Build back home",
  description: "A clearer path to reliable property teams in Cape Verde. Build, renovate, buy, or arrange ongoing care, with transparent verification.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#page-content">Skip to content</a>
        <Header />
        <div id="page-content" className="page-content">{children}</div>
        <footer className="site-footer"><span>sentinel.</span><p>Concept prototype · Fictional examples · No real requests or payments</p><span>Cape Verde, closer.</span></footer>
      </body>
    </html>
  );
}
