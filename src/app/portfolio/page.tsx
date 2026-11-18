import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { PortfolioGrid } from "@/components/businesses/PortfolioGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getWebPageSchema } from "@/lib/schema";
import { siteConfig } from "@/data/site";
import { portfolioProjects } from "@/data/portfolio";

const PAGE_DESCRIPTION =
  "Case studies and projects from across BrandOrbit Group's six verticals — marketing, technology, education, media, consulting, and venture building.";

export const metadata: Metadata = buildPageMetadata({
  title: "Portfolio",
  description: PAGE_DESCRIPTION,
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "CollectionPage",
            path: "/portfolio",
            name: `Portfolio — ${siteConfig.name}`,
            description: PAGE_DESCRIPTION,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Portfolio", path: "/portfolio" },
          ]),
        ]}
      />
      <PageHero
        eyebrow="Portfolio"
        title="Turning Ideas Into Impact."
        description="A growing collection of work across our verticals — filter by business to see projects relevant to your needs."
      />
      <section className="bg-surface py-20 sm:py-28">
        <Container>
          <PortfolioGrid projects={portfolioProjects} />
        </Container>
      </section>
    </>
  );
}
