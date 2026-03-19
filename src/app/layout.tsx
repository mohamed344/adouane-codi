import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaSApp",
  description: "The smartest way to search and discover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
