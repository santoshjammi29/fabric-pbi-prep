import { Metadata } from "next";
import { Suspense } from "react";
import { getCompanyProfilesDAL } from "@/lib/dal";
import { CompanyResearchClient } from "./company-research-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const revalidate = 3600; // 1-hour ISR cache on edge

export async function generateMetadata(): Promise<Metadata> {
  const profiles = await getCompanyProfilesDAL();
  return generatePageMetadata({
    title: `Company Research Hub (${profiles.length} Tech & GCC Profiles) | Data Architect Prep`,
    description: `Target interview playbooks and technical architectures for ${profiles.length} elite GCCs, FinTechs, and BigTech enterprises.`,
    path: "/company-research",
    keywords: ["GCC Companies", "Data Engineering Interviews", "BigTech Architecture", "FinTech Lakehouse"],
  });
}

export default async function CompanyResearchPage() {
  const profiles = await getCompanyProfilesDAL();

  const courseSchema = generateCourseSchema(
    "Enterprise Data Engineering Company Research & Interview Playbooks",
    `Comprehensive technical interview preparation and architecture standards for ${profiles.length} Global Capability Centers and BigTech employers.`
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading Company Profiles...</span>
            </div>
          </div>
        }
      >
        <CompanyResearchClient initialProfiles={profiles} />
      </Suspense>
    </>
  );
}
