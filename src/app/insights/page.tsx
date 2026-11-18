import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getWebPageSchema } from "@/lib/schema";
import { siteConfig } from "@/data/site";
import { insightArticles } from "@/data/insights";

const PAGE_DESCRIPTION =
  "Ideas and perspectives on business strategy, technology, AI, marketing, and entrepreneurship from BrandOrbit Group.";

export const metadata: Metadata = buildPageMetadata({
  title: "Insights",
  description: PAGE_DESCRIPTION,
  path: "/insights",
  keywords: [
    "BrandOrbit insights",
    "business strategy articles",
    "AI automation insights",
    "brand growth perspectives",
  ],
});

export default function InsightsPage() {
  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "CollectionPage",
            path: "/insights",
            name: `Insights — ${siteConfig.name}`,
            description: PAGE_DESCRIPTION,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Insights", path: "/insights" },
          ]),
        ]}
      />
      <PageHero
        eyebrow="Insights"
        title="Ideas on Growth, Technology & Business."
        description="Articles and perspectives from across BrandOrbit's verticals — published here as they're ready."
      />
      <section className="bg-bg py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {insightArticles.map((article, i) => (
              <Reveal key={article.slug} delay={i * 0.06} className="rounded-2xl border border-white/10 bg-surface p-7">
                {article.status === "unpublished" && (
                  <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">
                    Unpublished draft
                  </span>
                )}
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-teal">
                  {article.category}
                </p>
                <h2 className="mt-2 text-lg font-bold leading-snug text-white">{article.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{article.excerpt}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
