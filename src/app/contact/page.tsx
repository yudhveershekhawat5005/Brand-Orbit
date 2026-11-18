import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { ContactForm } from "@/components/shared/ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getWebPageSchema } from "@/lib/schema";
import { siteConfig, whatsappHref } from "@/data/site";

const PAGE_DESCRIPTION =
  "Contact BrandOrbit Group in Jaipur, Rajasthan (India) at hello@brandorbitgroup.in or +91 86966 40524 for business enquiries, consulting, or partnerships.";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description: PAGE_DESCRIPTION,
  path: "/contact",
  keywords: [
    "contact BrandOrbit Group",
    "business consulting Jaipur contact",
    "BrandOrbit partnerships",
  ],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "ContactPage",
            path: "/contact",
            name: `Contact Us — ${siteConfig.name}`,
            description: PAGE_DESCRIPTION,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Contact Us", path: "/contact" },
          ]),
        ]}
      />
      <PageHero
        eyebrow="Contact Us"
        title="Let's Start a Conversation."
        description="Whether you're looking for the right expertise or exploring a partnership, tell us a bit about what you have in mind."
      />

      <section className="bg-bg py-20 sm:py-28">
        <Container className="grid gap-16 lg:grid-cols-[1.3fr_0.7fr]">
          <Reveal>
            <Suspense fallback={null}>
              <ContactForm />
            </Suspense>
          </Reveal>

          <Reveal delay={0.1} className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-surface p-7">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                Email
              </h3>
              <a href={`mailto:${siteConfig.contact.email}`} className="mt-3 block text-white">
                {siteConfig.contact.email}
              </a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-surface p-7">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                WhatsApp
              </h3>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-3 block text-white">
                {siteConfig.contact.phoneDisplay}
              </a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-surface p-7">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                Location
              </h3>
              <p className="mt-3 text-white">{siteConfig.contact.location}</p>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
