import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BISSALL — Bissap artisanal",
  description: "Bissap artisanal fait maison à Paris. Sans additifs, sans conservateurs.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased" style={{ background: "var(--beige)" }}>
        {children}
      </body>
    </html>
  );
}
