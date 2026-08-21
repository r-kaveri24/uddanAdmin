import type { Metadata } from "next";
import LogoutModalProvider from "./LogoutModalProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uddan Admin Panel",
  description: "Admin panel for Uddan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LogoutModalProvider>
          {children}
        </LogoutModalProvider>
      </body>
    </html>
  );
}