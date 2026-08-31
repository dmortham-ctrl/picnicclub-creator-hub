import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Picnic Club | Creator Commerce Ecosystem",
  description: "The home for Indonesia's fastest growing creator community.",
  metadataBase: new URL("https://picnicclub.id"),
  openGraph: {
    siteName: "Picnic Club",
    type: "website",
    locale: "id_ID",
    url: "https://picnicclub.id",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <a href="#content" className="skip-link">Lewati ke konten</a>
        <div id="content">{children}</div>
      </body>
    </html>
  );
}
