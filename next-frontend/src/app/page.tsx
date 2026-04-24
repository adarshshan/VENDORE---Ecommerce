import React from "react";
import HomePageContent from "@/src/components/HomePageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | ThreadCo",
  description: "ThreadCo is your ultimate destination for men's fashion and stylish women's apparel. Discover premium quality clothing, trending styles, and exclusive deals with fast delivery.",
  openGraph: {
    title: "Home | ThreadCo",
    description: "ThreadCo is your ultimate destination for men's fashion and stylish women's apparel.",
    type: "website",
    url: "https://threadco.online",
  },
};

export default function Page() {
  return <HomePageContent />;
}

