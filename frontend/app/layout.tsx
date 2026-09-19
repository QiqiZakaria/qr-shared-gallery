import "./globals.css";

export const metadata = {
  title: "Shared Gallery",
  description: "Scan, upload and share event photos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
