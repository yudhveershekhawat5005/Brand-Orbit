import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { CareersForm } from "@/components/shared/CareersForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getWebPageSchema } from "@/lib/schema";
import { siteConfig } from "@/data/site";

const PAGE_DESCRIPTION =
  "Join BrandOrbit Group or collaborate with us across marketing, technology & AI, education, media, business consulting, and venture building.";

export const metadata: Metadata = buildPageMetadata({
  title: "Careers & Collaborate",
  description: PAGE_DESCRIPTION,
  path: "/careers",
  keywords: [
    "BrandOrbit careers",
    "jobs Jaipur",
    "collaborate BrandOrbit Group",
  ],
});

export default function CareersPage() {
  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "WebPage",
            path: "/careers",
            name: `Careers & Collaborate — ${siteConfig.name}`,
            description: PAGE_DESCRIPTION,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Careers & Collaborate", path: "/careers" },
          ]),
        ]}
      />
      <PageHero
        eyebrow="Careers & Collaborate"
        title="Grow With BrandOrbit."
        description="As a newly starting, founder-led group, we're building our team deliberately. If you'd like to work with us — as a team member, freelancer or collaborator — we'd like to hear from you."
      />

      <section className="bg-bg py-20 sm:py-28">
        <Container className="grid gap-16 lg:grid-cols-[1.3fr_0.7fr]">
          <Reveal>
            <CareersForm />
          </Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-white/10 bg-surface p-7">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              Open Roles
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              We don&apos;t have specific open roles listed yet, but we&apos;re always
              glad to hear from people interested in any of our six verticals —
              marketing, technology, education, media, consulting or venture building.
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
