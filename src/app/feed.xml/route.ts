import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const feedXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Lakehouse Architect - Modern Lakehouse Architecture &amp; Systems</title>
  <link>https://lakehousearchitect.com</link>
  <description>The definitive open-access enterprise reference platform for Lakehouse Architecture, Medallion Architecture, Microsoft Fabric OneLake, Databricks Delta Lake, and Apache Spark 4.0.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="https://lakehousearchitect.com/feed.xml" rel="self" type="application/rss+xml" />
  
  <item>
    <title>Lakehouse Architecture: The Definitive Systems Blueprint</title>
    <link>https://lakehousearchitect.com/</link>
    <guid>https://lakehousearchitect.com/#blueprint</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>Comprehensive architectural guide to building, governing, and scaling high-performance modern data lakehouses using Delta Lake, Apache Iceberg, Unity Catalog, and Microsoft Fabric.</description>
  </item>
  
  <item>
    <title>Enterprise Lakehouse Architecture Hub (3,206+ Scenarios)</title>
    <link>https://lakehousearchitect.com/architecture</link>
    <guid>https://lakehousearchitect.com/architecture</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>3,206+ real-world production system design scenarios, distributed failure modes, and architectural trade-offs for Lead Data Engineers and Architects.</description>
  </item>

  <item>
    <title>Lakehouse Concepts &amp; Architecture Glossary (660 Terms)</title>
    <link>https://lakehousearchitect.com/concepts</link>
    <guid>https://lakehousearchitect.com/concepts</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>Complete architectural lexicon covering Delta Lake internals, Liquid Clustering, Apache Iceberg metadata, and Unity Catalog.</description>
  </item>

  <item>
    <title>Apache Spark 4.0 Lakehouse Compute Engine Lab</title>
    <link>https://lakehousearchitect.com/spark-engine</link>
    <guid>https://lakehousearchitect.com/spark-engine</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>Interactive simulator of Apache Spark 4.0 Catalyst Optimizer, Tungsten memory allocator, and shuffle mechanics.</description>
  </item>
</channel>
</rss>`;

  return new NextResponse(feedXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
