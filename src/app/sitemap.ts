import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { verticals } from "@/data/verticals";
import { absoluteUrl } from "@/lib/seo";

const LAST_MODIFIED = "2026-11-18";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [
        absoluteUrl("/images/hero-team-collaboration.jpg"),
        absoluteUrl("/images/about-team-unity.jpg"),
      ],
    },
    {
      url: absoluteUrl("/businesses"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
      images: verticals
        .map((v) => v.cardImage)
        .filter((img): img is string => Boolean(img))
        .map((img) => absoluteUrl(img)),
    },
    {
      url: absoluteUrl("/services"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.85,
      images: [absoluteUrl("/images/about-team-unity.jpg")],
    },
    {
      url: absoluteUrl("/industries"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/approach"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/portfolio"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/insights"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/careers"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/privacy-policy"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const verticalEntries: MetadataRoute.Sitemap = verticals.map((vertical) => ({
    url: absoluteUrl(`/businesses/${vertical.slug}`),
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 0.9,
    ...(vertical.cardImage
      ? { images: [absoluteUrl(vertical.cardImage)] }
      : {}),
  }));

  return [...staticEntries, ...verticalEntries];
}
