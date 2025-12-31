import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MakeConnect Admin",
  description: "Admin dashboard for MakeConnect platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
