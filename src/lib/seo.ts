import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

export interface PageSeoOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

export function absoluteUrl(path = ""): string {
  const normalized = path.startsWith("/") || path === "" ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  imageAlt,
  type = "website",
  noIndex = false,
}: PageSeoOptions): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = `${title} — ${siteConfig.name}`;
  const ogImages = image
    ? [
        {
          url: absoluteUrl(image),
          alt: imageAlt ?? fullTitle,
        },
      ]
    : undefined;

  return {
    title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: path || "/",
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: "en_IN",
      type,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(image ? { images: [absoluteUrl(image)] } : {}),
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
        }
      : {
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
}
