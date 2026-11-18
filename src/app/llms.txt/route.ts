import { siteConfig } from "@/data/site";
import { verticals } from "@/data/verticals";
import { absoluteUrl } from "@/lib/seo";

export async function GET() {
  const leadershipLine = siteConfig.leadership
    .map((p) => `${p.name} (${p.role})`)
    .join(", ");

  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `- **Website**: ${siteConfig.url}`,
    `- **Tagline**: ${siteConfig.tagline}`,
    `- **Headquarters**: ${siteConfig.contact.location}`,
    `- **Leadership**: ${leadershipLine}`,
    `- **Email**: ${siteConfig.contact.email}`,
    `- **Phone / WhatsApp**: ${siteConfig.contact.phoneDisplay}`,
    `- **Full AI Reference**: ${absoluteUrl("/llms-full.txt")}`,
    `- **Sitemap**: ${absoluteUrl("/sitemap.xml")}`,
    "",
    "## Core Pages",
    `- [Home](${siteConfig.url}): Overview of BrandOrbit Group, six verticals, working process, and FAQs.`,
    `- [About Us](${absoluteUrl("/about")}): Founder-led multi-vertical group overview, mission, vision, and leadership.`,
    `- [Our Businesses](${absoluteUrl("/businesses")}): All six specialised business verticals under one unified identity.`,
    `- [Services](${absoluteUrl("/services")}): Complete list of capabilities across all six business verticals.`,
    `- [Industries We Serve](${absoluteUrl("/industries")}): Startups, SMBs, education providers, consumer brands, professional services firms, and founders.`,
    `- [Our Approach](${absoluteUrl("/approach")}): Five-stage execution model — Discover, Strategise, Build, Launch, Scale.`,
    `- [Portfolio](${absoluteUrl("/portfolio")}): Showcase of projects across BrandOrbit's six verticals.`,
    `- [Insights](${absoluteUrl("/insights")}): Perspectives on business strategy, AI, technology, and marketing.`,
    `- [Careers & Collaborate](${absoluteUrl("/careers")}): Join or collaborate with BrandOrbit Group.`,
    `- [Contact Us](${absoluteUrl("/contact")}): Business enquiries and partnership requests.`,
    "",
    "## Business Verticals",
    ...verticals.map(
      (v) =>
        `- [${v.name}](${absoluteUrl(`/businesses/${v.slug}`)}): ${v.tagline}`
    ),
    "",
    "## Optional",
    `- [Privacy Policy](${absoluteUrl("/privacy-policy")})`,
    `- [Terms & Conditions](${absoluteUrl("/terms")})`,
    `- [Full Knowledge Base (llms-full.txt)](${absoluteUrl("/llms-full.txt")})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
