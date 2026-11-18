import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { FaqSection } from "@/components/shared/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import {
  getBreadcrumbSchema,
  getVerticalsItemListSchema,
  getWebPageSchema,
} from "@/lib/schema";
import { siteConfig } from "@/data/site";
import { verticals } from "@/data/verticals";
import { servicesFaqs } from "@/data/faqs";

const PAGE_DESCRIPTION =
  "Explore BrandOrbit Group's services across all six business verticals: marketing & growth, technology & AI automation, education, media & creative, business consulting, and venture building.";

export const metadata: Metadata = buildPageMetadata({
  title: "Services",
  description: PAGE_DESCRIPTION,
  path: "/services",
  keywords: verticals.flatMap((v) => [v.name, ...v.capabilities]),
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "WebPage",
            path: "/services",
            name: `Services — ${siteConfig.name}`,
            description: PAGE_DESCRIPTION,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Services", path: "/services" },
          ]),
          getVerticalsItemListSchema(),
        ]}
      />
      <PageHero
        eyebrow="Services"
        title="Everything Businesses Need to Move Forward."
        description="Our services are organised under six verticals, so you can draw on exactly the capability your business needs — one at a time, or combined."
      />

      <section className="bg-bg py-20 sm:py-28">
        <Container className="space-y-10">
          {verticals.map((v, i) => (
            <Reveal
              key={v.slug}
              delay={i * 0.04}
              className="grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-surface p-8 sm:grid-cols-[1fr_1.4fr] sm:items-center"
            >
              <div>
                <span className="text-sm font-semibold text-teal">{v.index}</span>
                <h2 className="mt-2 text-xl font-bold text-white">{v.name}</h2>
                <Link
                  href={`/businesses/${v.slug}`}
                  className="mt-3 inline-block text-sm font-semibold text-white underline-offset-4 hover:underline"
                >
                  View vertical page →
                </Link>
              </div>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {v.capabilities.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-white/75">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </Container>
      </section>

      <FaqSection
        eyebrow="Services FAQ"
        title="Questions About Our Services."
        description="Direct answers on how BrandOrbit's six verticals work individually or together."
        items={servicesFaqs}
        surface="bg-surface"
      />
    </>
  );
}
