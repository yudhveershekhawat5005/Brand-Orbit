import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import {
  getBreadcrumbSchema,
  getIndustriesItemListSchema,
  getWebPageSchema,
} from "@/lib/schema";
import { siteConfig } from "@/data/site";
import { industries, industriesNotice } from "@/data/industries";

const PAGE_DESCRIPTION =
  "BrandOrbit Group partners with startups, SMBs, education providers, consumer & D2C brands, professional services firms, and founders.";

export const metadata: Metadata = buildPageMetadata({
  title: "Industries We Serve",
  description: PAGE_DESCRIPTION,
  path: "/industries",
  keywords: industries.map((i) => i.name),
});

export default function IndustriesPage() {
  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "CollectionPage",
            path: "/industries",
            name: `Industries We Serve — ${siteConfig.name}`,
            description: PAGE_DESCRIPTION,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Industries We Serve", path: "/industries" },
          ]),
          getIndustriesItemListSchema(),
        ]}
      />
      <PageHero
        eyebrow="Industries We Serve"
        title="Built for Businesses in Motion."
        description="BrandOrbit works with businesses at different stages — from first-time founders to established teams looking to professionalise and grow."
      />

      <section className="bg-bg py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, i) => (
              <Reveal
                key={industry.name}
                delay={i * 0.05}
                className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-8"
              >
                <h2 className="text-lg font-bold text-white">{industry.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {industry.description}
                </p>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 text-sm text-white/50">{industriesNotice}</p>
        </Container>
      </section>
    </>
  );
}
