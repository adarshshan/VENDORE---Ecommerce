import React from "react";
import ProductDetailsContent from "@/src/components/ProductDetailsContent";
import { Metadata } from "next";
import { getProductBySlug } from "@/src/services/api";
import Script from "next/script";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (product) {
      return {
        title: product.name,
        description:
          product.description ||
          `Buy ${product.name} at ThreadCo. Modern fashion and accessories for men and women.`,
        openGraph: {
          title: product.name,
          description: product.description,
          images: product.images?.map((img) => img.url),
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }
  return {
    title: "Product Details",
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return <ProductDetailsContent />;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images?.map((img) => img.url),
    description: product.description,
    sku: product._id.toString(),
    brand: {
      "@type": "Brand",
      name: product.brand || "ThreadCo",
    },
    offers: {
      "@type": "Offer",
      url: `https://threadco.online/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock && product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

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
        name: "Products",
        item: "https://threadco.online/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://threadco.online/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductDetailsContent />
    </>
  );
}
