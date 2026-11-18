import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { Accordion } from "@/components/shared/Accordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFaqSchema } from "@/lib/schema";
import type { FaqItem } from "@/data/faqs";

export function FaqSection({
  eyebrow = "Frequently Asked Questions",
  title = "Clear Answers About BrandOrbit Group.",
  description = "Key facts about our verticals, working process, leadership, and how we partner with businesses.",
  items,
  surface = "bg-surface",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  items: FaqItem[];
  surface?: "bg-surface" | "bg-bg";
}) {
  return (
    <section id="faq" className={`${surface} py-20 sm:py-28`}>
      <JsonLd data={getFaqSchema(items)} />
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              {eyebrow}
            </p>
            <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
              {description}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <Accordion
              items={items.map((item) => ({
                title: item.question,
                content: item.answer,
              }))}
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
