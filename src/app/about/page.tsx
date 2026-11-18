import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/shared/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import {
  getBreadcrumbSchema,
  getLeadershipSchema,
  getWebPageSchema,
} from "@/lib/schema";
import { siteConfig } from "@/data/site";

const PAGE_DESCRIPTION =
  "BrandOrbit Group is a founder-led, multi-industry business group in Jaipur, India, bringing together six specialised divisions and a venture-building arm under one identity.";

export const metadata: Metadata = buildPageMetadata({
  title: "About Us",
  description: PAGE_DESCRIPTION,
  path: "/about",
  image: "/images/about-team-unity.jpg",
  imageAlt: "BrandOrbit Group leadership and team",
  keywords: [
    "About BrandOrbit Group",
    "Lalit Kumawat",
    "Jitendra Kumar Kumawat",
    "business group Jaipur",
    "venture building India",
  ],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          getWebPageSchema({
            type: "AboutPage",
            path: "/about",
            name: `About Us — ${siteConfig.name}`,
            description: PAGE_DESCRIPTION,
          }),
          getBreadcrumbSchema([
            { name: "Home", path: "" },
            { name: "About Us", path: "/about" },
          ]),
          getLeadershipSchema(),
        ]}
      />
      <PageHero
        eyebrow="About Us"
        title="A Founder-Led Group, Built to Grow."
        description="BrandOrbit Group brings together specialised business divisions and a venture-building arm under one unified identity — serving businesses today and building new ones for tomorrow."
      />

      <section className="bg-bg py-20 sm:py-28">
        <Container className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Who We Are</h2>
            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
              BrandOrbit Group is a newly starting, founder-led business group operating
              across six specialised verticals: marketing &amp; growth, technology &amp;
              AI, education, media &amp; creative, business consulting, and venture
              building. Each vertical is operational today, working with businesses as
              a specialised partner.
            </p>
            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
              BrandOrbit operates on two models: providing specialised services to
              businesses and organisations, and developing, building and growing its
              own ventures. We are not a single-service agency — we are a parent
              identity bringing multiple capabilities together under one roof.
            </p>
            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
              As a new group, we are building deliberately: strengthening each vertical,
              expanding our portfolio of work, and growing the leadership team around
              our founder over time.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-surface p-8">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                Mission
              </p>
              <p className="mt-4 text-base leading-relaxed text-white">
                To give businesses and entrepreneurs access to the full range of
                capability they need to grow — and to build new ventures that create
                lasting value.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-surface p-8">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                Vision
              </p>
              <p className="mt-4 text-base leading-relaxed text-white">
                To grow BrandOrbit into a recognised ecosystem of business divisions and
                independent ventures, each strengthened by the group around it.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-surface py-20 sm:py-28">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Leadership</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/65">
              BrandOrbit Group was started to bring specialised business capabilities together
              under one identity, and to build ventures that grow alongside the businesses we serve.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {siteConfig.leadership.map((person) => (
                <div
                  key={person.name}
                  className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface-alt p-10"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-2xl font-bold text-teal">
                    {person.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{person.name}</h3>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                    {person.role}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-navy py-20 sm:py-28">
        <Container className="text-center">
          <Reveal>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Want to know more about what we do?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/businesses" variant="primary">
                Explore Our Businesses
              </Button>
              <Button href="/contact" variant="secondary">
                Get in Touch
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
