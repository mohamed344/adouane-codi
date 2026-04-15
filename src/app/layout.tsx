import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CODI PRO MAX — Tariff & customs intelligence",
    template: "%s · CODI PRO MAX",
  },
  description:
    "Search, analyze, and translate global tariff codes in seconds. Built for importers, freight forwarders, and customs brokers.",
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
