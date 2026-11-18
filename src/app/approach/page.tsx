import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import {
  getBreadcrumbSchema,
  getHowToSchema,
  getWebPageSchema,
} from "@/lib/schema";
import { siteConfig } from "@/data/site";
import { processSteps } from "@/data/process";

const PAGE_DESCRIPTION =
  "How BrandOrbit Group takes ideas from vision to execution through a five-stage process: Discover, Strategise, Build, Launch, and Scale.";

export const metadata: Metadata = buildPageMetadata({
  title: "Our Approach",
  description: PAGE_DESCRIPTION,
  path: "/approach",
  keywords: [
    "BrandOrbit approach",
    "Discover Strategise Build Launch Scale",
    "business execution process",
    "venture launch methodology",
  ],
});

export default function ApproachPage() {
  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "WebPage",
            path: "/approach",
            name: `Our Approach — ${siteConfig.name}`,
            description: PAGE_DESCRIPTION,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Our Approach", path: "/approach" },
          ]),
          getHowToSchema(),
        ]}
      />
      <PageHero
        eyebrow="Our Approach"
        title="From Vision to Execution."
        description="Whatever the vertical, our work follows the same disciplined process — understand first, plan carefully, build well, launch with coordination, and scale what works."
      />

      <section className="bg-bg py-20 sm:py-28">
        <Container>
          <div className="space-y-6">
            {processSteps.map((step, i) => (
              <div key={step.index} id={`step-${step.index}`}>
                <Reveal
                  delay={i * 0.06}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface p-8 sm:flex-row sm:items-start sm:gap-8"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-lg font-bold text-teal">
                    {step.index}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{step.title}</h2>
                    <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/70">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
