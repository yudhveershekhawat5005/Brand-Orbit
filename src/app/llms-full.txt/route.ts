import { siteConfig } from "@/data/site";
import { verticals } from "@/data/verticals";
import { industries } from "@/data/industries";
import { processSteps } from "@/data/process";
import { homeFaqs, servicesFaqs } from "@/data/faqs";
import { absoluteUrl } from "@/lib/seo";

export async function GET() {
  const lines = [
    `# ${siteConfig.name} — Complete Knowledge Reference`,
    "",
    `> ${siteConfig.description}`,
    "",
    "## Identity & Key Facts",
    `- **Name**: ${siteConfig.name} (also known as ${siteConfig.shortName})`,
    `- **Tagline**: ${siteConfig.tagline}`,
    `- **Canonical URL**: ${siteConfig.url}`,
    `- **Location**: ${siteConfig.contact.location}`,
    `- **Email**: ${siteConfig.contact.email}`,
    `- **Phone / WhatsApp**: ${siteConfig.contact.phoneDisplay}`,
    `- **Business Model**: Dual-model multi-industry business group providing specialised client services across six verticals while developing and scaling its own ventures.`,
    "",
    "## Leadership",
    ...siteConfig.leadership.map((p) => `- **${p.name}** — ${p.role}`),
    "",
    "## Mission & Vision",
    "- **Mission**: To give businesses and entrepreneurs access to the full range of capability they need to grow — and to build new ventures that create lasting value.",
    "- **Vision**: To grow BrandOrbit into a recognised ecosystem of business divisions and independent ventures, each strengthened by the group around it.",
    "",
    "## Business Verticals & Capabilities",
    "",
    ...verticals.flatMap((v) => [
      `### ${v.index}. ${v.name}`,
      `- **URL**: ${absoluteUrl(`/businesses/${v.slug}`)}`,
      `- **Tagline**: ${v.tagline}`,
      `- **Overview**: ${v.description}`,
      "- **Capabilities**:",
      ...v.capabilities.map((c) => `  - ${c}`),
      "",
    ]),
    "## Industries & Clients Served",
    ...industries.map((ind) => `- **${ind.name}**: ${ind.description}`),
    "",
    "## Working Process (From Vision to Execution)",
    ...processSteps.map(
      (step) => `${Number(step.index)}. **${step.title}**: ${step.description}`
    ),
    "",
    "## Frequently Asked Questions",
    "",
    ...[...homeFaqs, ...servicesFaqs].flatMap((faq) => [
      `### ${faq.question}`,
      faq.answer,
      "",
    ]),
    "## Key Links",
    `- Home: ${siteConfig.url}`,
    `- About Us: ${absoluteUrl("/about")}`,
    `- Our Businesses: ${absoluteUrl("/businesses")}`,
    `- Services: ${absoluteUrl("/services")}`,
    `- Industries: ${absoluteUrl("/industries")}`,
    `- Our Approach: ${absoluteUrl("/approach")}`,
    `- Portfolio: ${absoluteUrl("/portfolio")}`,
    `- Insights: ${absoluteUrl("/insights")}`,
    `- Careers: ${absoluteUrl("/careers")}`,
    `- Contact: ${absoluteUrl("/contact")}`,
    `- Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `- Robots: ${absoluteUrl("/robots.txt")}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
