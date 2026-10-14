import type { Metadata } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "ArkivSight · Query-to-Dashboard Studio",
  description:
    "Explore public Arkiv data. Build queries, visualize results, and publish wallet-owned dashboards.",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
