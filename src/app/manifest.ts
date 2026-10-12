import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Microsoft Data Platform Architect Prep",
    short_name: "Fabric Prep",
    description:
      "Enterprise interview preparation and system design portal for Microsoft Fabric, Databricks, Delta Lake, and Distributed Lakehouse architectures.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0B",
    theme_color: "#0A0A0B",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
