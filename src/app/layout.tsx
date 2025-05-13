import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

// Use Poppins for headings
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

// Use Inter for body text
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Code Review Agent | Improve Code Quality with AI",
  description: "Automate code reviews with our AI-powered tool. Get actionable feedback on code quality, security, and performance to ship better code faster.",
  keywords: "code review, AI code review, static analysis, code quality, security analysis, developer tools",
  authors: [{ name: "AI Code Review Team" }],
  openGraph: {
    title: "AI Code Review Agent | Ship Better Code Faster",
    description: "AI-powered code reviews that help developers write cleaner, safer, and more efficient code.",
    url: "https://ai-code-review.example.com",
    siteName: "AI Code Review Agent",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}