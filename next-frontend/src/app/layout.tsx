import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@/src/app/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Providers from "@/src/components/Providers";
import ClientLayout from "@/src/components/ClientLayout";
import ThemeRegistry from "@/src/lib/ThemeRegistry";
import Script from "next/script";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: {
    default: "ThreadCo | Modern Fashion for Men & Women",
    template: "%s | ThreadCo",
  },
  description:
    "Shop the latest trends in men's and women's fashion at ThreadCo. Discover premium quality clothing, stylish accessories, and trendy outfits designed for the modern lifestyle.",
  keywords: [
    "men's fashion",
    "women's clothing",
    "trendy outfits",
    "fashion accessories",
    "online clothing store",
    "ThreadCo",
  ],
  verification: {
    google: "NA-KL2F4vaF-Dcl0wqe8WX9V3x9sJ1tdjSOTjIGrh9Q",
  },
  authors: [{ name: "ThreadCo" }],
  creator: "ThreadCo",
  publisher: "ThreadCo",
  metadataBase: new URL("https://threadco.online"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://threadco.online",
    siteName: "ThreadCo",
    title: "ThreadCo | Modern Fashion for Men & Women",
    description:
      "Discover premium quality fashion and accessories for men and women at ThreadCo.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ThreadCo Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ThreadCo | Modern Fashion for Men & Women",
    description: "Quality fashion for men and women.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ThreadCo",
  url: "https://threadco.online",
  logo: "https://threadco.online/logo.png",
  sameAs: [
    "https://facebook.com/threadco",
    "https://instagram.com/threadco",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-XXXXXXXXXX",
    contactType: "customer service",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
        <meta
          name="google-site-verification"
          content="NA-KL2F4vaF-Dcl0wqe8WX9V3x9sJ1tdjSOTjIGrh9Q"
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${roboto.variable} antialiased`}>
        <ThemeRegistry>
          <Providers>
            <ClientLayout>{children}</ClientLayout>
          </Providers>
        </ThemeRegistry>
      </body>
    </html>
  );
}
