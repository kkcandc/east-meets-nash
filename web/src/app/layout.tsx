import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ConversionBar } from "@/components/ConversionBar";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "East Meets Nash",
    template: "%s | East Meets Nash",
  },
  description: "East Nashville local news, gossip, civic watchdog coverage, events, restaurants, and classifieds.",
};

const navItems = [
  ["Front", "/"],
  ["Feed", "/feed"],
  ["Topics", "/topics"],
  ["Desk", "/admin/sources"],
  ["Issue", "/admin/issues"],
  ["Launch", "/admin"],
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand-lockup" href="/">
            <img className="brand-seal" src="/assets/seal.svg" alt="East Meets Nash seal" />
            <span>
              <strong>East Meets Nash</strong>
              <small>East Nashville, with receipts</small>
            </span>
          </Link>
          <nav className="top-nav" aria-label="Primary">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <Link className="atxp-button" href="/feed">
            Login
          </Link>
        </header>
        <ConversionBar />
        {children}
      </body>
    </html>
  );
}
