import React from "react";
import ProductList from "@/src/components/ProductList";
import { Metadata } from "next";
import { getCategoryBySlug } from "@/src/services/api";
import Script from "next/script";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (category) {
      return {
        title: `${category.name} Collection`,
        description: `Explore our ${category.name} collection. High-quality and stylish products for men and women at ThreadCo.`,
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }
  return {
    title: "Collection",
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://threadco.online",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: "https://threadco.online/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category?.name || "Collection",
        item: `https://threadco.online/category/${slug}`,
      },
    ],
  };

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductList />
    </>
  );
}
