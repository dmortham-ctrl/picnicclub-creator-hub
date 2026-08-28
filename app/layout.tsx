import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Picnic Club | Creator Commerce Ecosystem",
  description: "The home for Indonesia's fastest growing creator community.",
  metadataBase: new URL("https://picnicclub.id")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
