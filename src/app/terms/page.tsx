import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getWebPageSchema } from "@/lib/schema";
import { siteConfig } from "@/data/site";

const PAGE_DESCRIPTION =
  "Terms & Conditions governing use of the BrandOrbit Group website (brandorbitgroup.in).";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms & Conditions",
  description: PAGE_DESCRIPTION,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "WebPage",
            path: "/terms",
            name: `Terms & Conditions — ${siteConfig.name}`,
            description: PAGE_DESCRIPTION,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Terms & Conditions", path: "/terms" },
          ]),
        ]}
      />
      <PageHero eyebrow="Legal" title="Terms & Conditions" />
      <section className="bg-bg py-16 sm:py-20">
        <Container className="max-w-3xl">
          <p className="text-sm text-white/60">
            This is a draft terms page for development purposes. It must be reviewed
            and finalised with legal guidance, including confirmed legal entity
            details, before the site goes live.
          </p>
          <h2 className="mt-8 text-xl font-bold text-white">Use of This Website</h2>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            This website is provided by {siteConfig.name} to share information about
            our business verticals, services and ventures. Content on this site is
            for general informational purposes and does not constitute a binding
            offer of services.
          </p>
          <h2 className="mt-8 text-xl font-bold text-white">Contact</h2>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            For questions about these terms, contact us at{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-teal">
              {siteConfig.contact.email}
            </a>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
