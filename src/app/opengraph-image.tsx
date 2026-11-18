import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";
import { verticals } from "@/data/verticals";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "radial-gradient(circle at 85% 15%, #1d3b8b 0%, #0b1120 45%, #05070d 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "9999px",
                background: "#2dd4bf",
              }}
            />
            <span
              style={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#2dd4bf",
              }}
            >
              {siteConfig.name}
            </span>
          </div>
          <span
            style={{
              fontSize: "18px",
              color: "rgba(248, 250, 252, 0.65)",
            }}
          >
            brandorbitgroup.in
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              maxWidth: "960px",
            }}
          >
            {siteConfig.tagline}
          </div>
          <div
            style={{
              fontSize: "24px",
              lineHeight: 1.45,
              color: "rgba(248, 250, 252, 0.78)",
              maxWidth: "920px",
            }}
          >
            {siteConfig.description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {verticals.map((v) => (
            <div
              key={v.slug}
              style={{
                display: "flex",
                padding: "10px 18px",
                borderRadius: "9999px",
                border: "1px solid rgba(45, 212, 191, 0.35)",
                background: "rgba(15, 23, 42, 0.75)",
                fontSize: "16px",
                fontWeight: 600,
                color: "#e2e8f0",
              }}
            >
              {v.shortName}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
