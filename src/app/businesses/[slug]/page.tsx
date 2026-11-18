import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/shared/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import {
  getBreadcrumbSchema,
  getHowToSchema,
  getVerticalServiceSchema,
  getWebPageSchema,
} from "@/lib/schema";
import { siteConfig } from "@/data/site";
import { verticals, getVerticalBySlug } from "@/data/verticals";
import { processSteps } from "@/data/process";
import { portfolioProjects } from "@/data/portfolio";

export function generateStaticParams() {
  return verticals.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata(props: PageProps<"/businesses/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const vertical = getVerticalBySlug(slug);
  if (!vertical) return {};
  return buildPageMetadata({
    title: vertical.name,
    description: vertical.description,
    path: `/businesses/${vertical.slug}`,
    image: vertical.cardImage,
    imageAlt: `${vertical.name} — ${siteConfig.name}`,
    keywords: [vertical.name, vertical.shortName, ...vertical.capabilities, siteConfig.name],
  });
}

export default async function VerticalPage(props: PageProps<"/businesses/[slug]">) {
  const { slug } = await props.params;
  const vertical = getVerticalBySlug(slug);
  if (!vertical) notFound();

  const relatedProjects = portfolioProjects.filter((p) => p.verticalSlug === vertical.slug);

  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "WebPage",
            path: `/businesses/${vertical.slug}`,
            name: `${vertical.name} — ${siteConfig.name}`,
            description: vertical.description,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Our Businesses", path: "/businesses" },
            { name: vertical.name, path: `/businesses/${vertical.slug}` },
          ]),
          getVerticalServiceSchema(vertical),
          getHowToSchema(),
        ]}
      />
      <PageHero eyebrow={`Business Vertical · ${vertical.index}`} title={vertical.name} description={vertical.tagline} />

      <section className="bg-bg py-20 sm:py-28">
        <Container className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">About This Vertical</h2>
            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
              {vertical.description}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="rounded-2xl border border-white/10 bg-surface p-8">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              Capabilities
            </h3>
            <ul className="mt-5 space-y-3">
              {vertical.capabilities.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm text-white">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section className="bg-navy py-20 sm:py-28">
        <Container>
          <Reveal>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">How We Work</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((step, i) => (
              <Reveal key={step.index} delay={i * 0.05} className="rounded-2xl border border-white/10 p-6">
                <span className="text-sm font-bold text-teal">{step.index}</span>
                <h3 className="mt-3 font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-20 sm:py-28">
        <Container>
          <Reveal>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Related Work</h2>
          </Reveal>
          {relatedProjects.length === 0 ? (
            <Reveal delay={0.1} className="mt-10 rounded-2xl border border-dashed border-white/20 bg-surface-alt p-10 text-center">
              <p className="text-white/60">
                Case studies for {vertical.shortName} are being finalised and will be
                published here shortly.
              </p>
            </Reveal>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => (
                <div key={project.slug} className="rounded-2xl bg-surface-alt p-6">
                  <h3 className="font-bold text-white">{project.title}</h3>
                  <p className="mt-3 text-sm text-white/70">{project.summary}</p>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="bg-bg py-20 sm:py-28">
        <Container className="text-center">
          <Reveal>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to work with our {vertical.shortName} team?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="primary">
                Start a Conversation
              </Button>
              <Button href="/businesses" variant="ghost">
                View All Businesses
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
