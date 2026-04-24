import React from "react";
import ContactContent from "@/src/components/ContactContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact ThreadCo | Customer Support & Inquiries",
  description: "Get in touch with ThreadCo for support, orders, and fashion queries. We're here to help you with your shopping experience.",
  alternates: {
    canonical: "https://threadco.online/contact",
  },
  openGraph: {
    title: "Contact ThreadCo | Customer Support",
    description: "Need help? Contact ThreadCo for any inquiries about our collections or your orders.",
    url: "https://threadco.online/contact",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
