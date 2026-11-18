import { siteConfig } from "@/data/site";
import { verticals } from "@/data/verticals";
import { industries } from "@/data/industries";
import { processSteps } from "@/data/process";
import type { FaqItem } from "@/data/faqs";
import type { Vertical } from "@/types";
import { absoluteUrl } from "@/lib/seo";

const ORG_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

const socialProfiles = [
  siteConfig.social.linkedin,
  siteConfig.social.instagram,
  siteConfig.social.twitter,
].filter((v): v is string => Boolean(v));

export function getGlobalGraphSchema() {
  const allCapabilities = verticals.flatMap((v) => v.capabilities);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": ORG_ID,
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        url: siteConfig.url,
        description: siteConfig.description,
        slogan: siteConfig.tagline,
        logo: {
          "@type": "ImageObject",
          "@id": `${siteConfig.url}/#logo`,
          url: absoluteUrl("/brand/brandorbit-logo.png"),
          contentUrl: absoluteUrl("/brand/brandorbit-logo.png"),
          caption: siteConfig.name,
        },
        image: absoluteUrl("/images/hero-team-collaboration.jpg"),
        email: siteConfig.contact.email,
        telephone: `+${siteConfig.contact.whatsapp.number}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Jaipur",
          addressRegion: "Rajasthan",
          addressCountry: "IN",
        },
        areaServed: [
          {
            "@type": "City",
            name: "Jaipur",
          },
          {
            "@type": "State",
            name: "Rajasthan",
          },
          {
            "@type": "Country",
            name: "India",
          },
        ],
        founder: {
          "@type": "Person",
          "@id": `${siteConfig.url}/#founder-lalit-kumawat`,
          name: "Lalit Kumawat",
          jobTitle: "Founder",
          worksFor: { "@id": ORG_ID },
        },
        member: siteConfig.leadership.map((person) => ({
          "@type": "Person",
          name: person.name,
          jobTitle: person.role,
          worksFor: { "@id": ORG_ID },
        })),
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "business enquiries",
            email: siteConfig.contact.email,
            telephone: `+${siteConfig.contact.whatsapp.number}`,
            areaServed: "IN",
            availableLanguage: ["en"],
          },
          {
            "@type": "ContactPoint",
            contactType: "partnerships",
            email: siteConfig.contact.email,
            telephone: `+${siteConfig.contact.whatsapp.number}`,
            areaServed: "IN",
            availableLanguage: ["en"],
          },
        ],
        knowsAbout: [
          ...verticals.map((v) => v.name),
          ...allCapabilities,
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${siteConfig.name} Business Verticals & Services`,
          itemListElement: verticals.map((vertical) => ({
            "@type": "OfferCatalog",
            name: vertical.name,
            description: vertical.description,
            url: absoluteUrl(`/businesses/${vertical.slug}`),
            itemListElement: vertical.capabilities.map((capability) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: capability,
                serviceType: vertical.name,
                provider: { "@id": ORG_ID },
              },
            })),
          })),
        },
        ...(socialProfiles.length > 0 ? { sameAs: socialProfiles } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: siteConfig.url,
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        description: siteConfig.description,
        inLanguage: "en-IN",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function getWebPageSchema({
  type = "WebPage",
  path,
  name,
  description,
}: {
  type?: "WebPage" | "AboutPage" | "CollectionPage" | "ContactPage";
  path: string;
  name: string;
  description: string;
}) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function getBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getHowToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How ${siteConfig.name} Works — From Vision to Execution`,
    description:
      "BrandOrbit Group's five-stage working process across all six business verticals: Discover, Strategise, Build, Launch, and Scale.",
    step: processSteps.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: step.title,
      text: step.description,
      url: absoluteUrl(`/approach#step-${step.index}`),
    })),
  };
}

export function getVerticalServiceSchema(vertical: Vertical) {
  const url = absoluteUrl(`/businesses/${vertical.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: vertical.name,
    alternateName: vertical.shortName,
    serviceType: vertical.name,
    description: vertical.description,
    url,
    ...(vertical.cardImage ? { image: absoluteUrl(vertical.cardImage) } : {}),
    provider: { "@id": ORG_ID },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${vertical.name} Capabilities`,
      itemListElement: vertical.capabilities.map((capability) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: capability,
        },
      })),
    },
  };
}

export function getVerticalsItemListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteConfig.name} Business Verticals`,
    description:
      "Six specialised business verticals operated by BrandOrbit Group.",
    numberOfItems: verticals.length,
    itemListElement: verticals.map((vertical, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: vertical.name,
      description: vertical.description,
      url: absoluteUrl(`/businesses/${vertical.slug}`),
    })),
  };
}

export function getIndustriesItemListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Industries Served by ${siteConfig.name}`,
    numberOfItems: industries.length,
    itemListElement: industries.map((industry, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: industry.name,
      description: industry.description,
    })),
  };
}

export function getLeadershipSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteConfig.name} Leadership`,
    itemListElement: siteConfig.leadership.map((person, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Person",
        name: person.name,
        jobTitle: person.role,
        worksFor: { "@id": ORG_ID },
      },
    })),
  };
}
