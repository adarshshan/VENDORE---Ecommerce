import React from "react";
import ReturnAndExchangeContent from "@/src/components/ReturnAndExchangeContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Exchange Policy | ThreadCo",
  description: "Learn about ThreadCo's easy 5-day return and exchange policy. We ensure a hassle-free process for our premium fashion collections.",
  alternates: {
    canonical: "https://threadco.online/return-and-exchange",
  },
  openGraph: {
    title: "Return & Exchange Policy | ThreadCo",
    description: "Easy 5-day returns and exchanges at ThreadCo. Your satisfaction is our priority.",
    url: "https://threadco.online/return-and-exchange",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ReturnAndExchangePage() {
  return <ReturnAndExchangeContent />;
}
