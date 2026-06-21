// app/layout.tsx

import "./globals.css";

export const metadata = {
  title: "MediWatch • Patient Portal",
  description: "Healthcare Dashboard",
  
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" >
      <head>
        {/* Standard HTML meta tag */}
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/Desktoplogo.png" />
      </head>

      <body>{children}</body>
    </html>
  );
}
