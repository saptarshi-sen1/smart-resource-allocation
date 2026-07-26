import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CrisisConnect — AI-Powered Disaster Response Platform",
  description:
    "CrisisConnect intelligently matches volunteers, allocates resources, and digitizes field reports, ensuring faster disaster response for NGOs and emergency teams.",
  keywords: ["disaster response", "NGO", "volunteers", "AI", "emergency"],
  authors: [{ name: "Saptarshi Sen" }],
  openGraph: {
    title: "CrisisConnect — AI-Powered Disaster Response",
    description:
      "Connecting NGOs, Volunteers, and Emergency Teams in Real Time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0b1325",
                color: "#f8fafc",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
