import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getWebPageSchema } from "@/lib/schema";
import { siteConfig } from "@/data/site";

const PAGE_DESCRIPTION =
  "Privacy Policy for BrandOrbit Group describing how enquiry, partnership, and careers information submitted through brandorbitgroup.in is collected and used.";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: PAGE_DESCRIPTION,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "WebPage",
            path: "/privacy-policy",
            name: `Privacy Policy — ${siteConfig.name}`,
            description: PAGE_DESCRIPTION,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Privacy Policy", path: "/privacy-policy" },
          ]),
        ]}
      />
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <section className="bg-bg py-16 sm:py-20">
        <Container className="max-w-3xl">
          <p className="text-sm text-white/60">
            This is a draft privacy policy for development purposes. It must be
            reviewed and finalised with legal guidance before the site goes live.
          </p>
          <h2 className="mt-8 text-xl font-bold text-white">Information We Collect</h2>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            When you submit a business enquiry, partnership request or careers
            application through this website, we collect the information you provide
            — such as your name, email address, company or organisation, and the
            contents of your message.
          </p>
          <h2 className="mt-8 text-xl font-bold text-white">How We Use It</h2>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            We use the information you submit solely to respond to your enquiry,
            evaluate partnership or career interest, and communicate with you about
            your request. We do not sell your information to third parties.
          </p>
          <h2 className="mt-8 text-xl font-bold text-white">Contact</h2>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            For questions about this policy, contact us at{" "}
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
