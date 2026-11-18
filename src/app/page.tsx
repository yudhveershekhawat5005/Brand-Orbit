import type { Metadata } from "next";
import MetroHero from "@/components/ui/scroll-locked-video-hero";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Ecosystem } from "@/components/home/Ecosystem";
import { Capabilities } from "@/components/home/Capabilities";
import { Industries } from "@/components/home/Industries";
import { Approach } from "@/components/home/Approach";
import { Portfolio } from "@/components/home/Portfolio";
import { VentureBuilding } from "@/components/home/VentureBuilding";
import { Partnerships } from "@/components/home/Partnerships";
import { Insights } from "@/components/home/Insights";
import { Newsletter } from "@/components/home/Newsletter";
import { FaqSection } from "@/components/shared/FaqSection";
import { FinalCta } from "@/components/home/FinalCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { getWebPageSchema } from "@/lib/schema";
import { homeFaqs } from "@/data/faqs";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={getWebPageSchema({
          type: "WebPage",
          path: "",
          name: `${siteConfig.name} — ${siteConfig.tagline}`,
          description: siteConfig.description,
        })}
      />
      <MetroHero
        title="Open the door to endless opportunities"
        subtitle="BrandOrbit Group is a business consulting and growth partner, bringing strategy, technology and marketing expertise to help you build, scale and launch."
        tagline="Expert consulting to turn your vision into growth."
        scrollHint="SCROLL TO ENTER"
        style={{ height: "calc(100dvh - 81px)" }}
      />
      <Hero />
      <About />
      <Ecosystem />
      <Capabilities />
      <Industries />
      <Approach />
      <Portfolio />
      <VentureBuilding />
      <Partnerships />
      <Insights />
      <Newsletter />
      <FaqSection items={homeFaqs} surface="bg-surface" />
      <FinalCta />
    </>
  );
}
