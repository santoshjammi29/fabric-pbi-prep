import { NextResponse } from "next/server";

export const dynamic = "force-static";

const SECURITY_TXT = `# Security Policy & Vulnerability Disclosure
# RFC 9116: https://www.rfc-editor.org/rfc/rfc9116.html
Contact: mailto:santu.jammi@gmail.com
Expires: 2027-10-22T08:00:00.000Z
Preferred-Languages: en
Canonical: https://lakehousearchitect.com/.well-known/security.txt
Policy: https://lakehousearchitect.com/security
`;

export async function GET() {
  return new NextResponse(SECURITY_TXT, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
