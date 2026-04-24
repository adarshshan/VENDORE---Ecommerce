import React from "react";
import HomePageContent from "@/src/components/HomePageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ThreadCo | Premium Men's & Women's Fashion Online",
  description:
    "Explore ThreadCo for the latest trends in men's and women's fashion. Shop our exclusive collection of premium clothing, stylish accessories, and more with fast shipping across India.",
  alternates: {
    canonical: "https://threadco.online",
  },
  openGraph: {
    title: "ThreadCo | Premium Men's & Women's Fashion Online",
    description:
      "Explore ThreadCo for the latest trends in men's and women's fashion. Shop our exclusive collection of premium clothing.",
    type: "website",
    url: "https://threadco.online",
  },
};

export default function Page() {
  return <HomePageContent />;
}

