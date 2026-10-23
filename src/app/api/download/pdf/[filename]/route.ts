import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const ALLOWED_PDFS = new Set([
  'databricks_master_cheatsheet.pdf',
  'databricks_sparksql_cheatsheet.pdf',
  'databricks_pyspark_cheatsheet.pdf',
  'databricks_spark_core_cheatsheet.pdf',
  'databricks_python_cheatsheet.pdf',
  'incident_runbooks.pdf',
  'lakehouse_enterprise_master_reference.pdf',
]);

const ALLOWED_ORIGINS = new Set([
  'https://moderndataengineer.uk',
  'https://www.moderndataengineer.uk',
  'https://lakehousearchitect.com',
  'https://www.lakehousearchitect.com',
]);

function setCorsHeaders(headers: Headers, request: Request | NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return;

  const isLocalhost =
    process.env.NODE_ENV !== 'production' &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  if (ALLOWED_ORIGINS.has(origin) || isLocalhost) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  setCorsHeaders(headers, request);
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename: rawFilename } = await params;
  const filename = decodeURIComponent(rawFilename || '').trim();

  if (!filename || !ALLOWED_PDFS.has(filename)) {
    return NextResponse.json({ error: 'PDF file not found or unauthorized' }, { status: 404 });
  }

  const isInline = request.nextUrl.searchParams.get('inline') === 'true';
  const disposition = isInline
    ? `inline; filename="${filename}"`
    : `attachment; filename="${filename}"`;

  // 1. Try Cloudflare Workers context (via OpenNext env.ASSETS or env.ARTIFACTS_BUCKET)
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const cloudflareContext = await getCloudflareContext({ async: true });
    const assets = (cloudflareContext?.env as any)?.ASSETS as { fetch: (req: Request) => Promise<Response> } | undefined;
    const bucket = (cloudflareContext?.env as any)?.ARTIFACTS_BUCKET as R2Bucket | undefined;

    if (assets) {
      const assetUrl = new URL(`/cheatsheets/pdf/${filename}`, request.url);
      const assetRes = await assets.fetch(new Request(assetUrl.toString()));
      if (assetRes.ok && assetRes.body) {
        const headers = new Headers();
        setCorsHeaders(headers, request);
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', disposition);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        return new NextResponse(assetRes.body as any, { status: 200, headers });
      }
    }

    if (bucket) {
      const r2Object = await bucket.get(`cheat-sheets/pdf/${filename}`);
      if (r2Object) {
        const headers = new Headers();
        setCorsHeaders(headers, request);
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', disposition);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('etag', r2Object.httpEtag);
        return new NextResponse(r2Object.body as any, { status: 200, headers });
      }
    }
  } catch {
    // Falling back to local disk read in Node.js dev or build mode
  }

  // 2. Node.js filesystem fallback
  const candidatePaths = [
    path.resolve(process.cwd(), 'public', 'cheatsheets', 'pdf', filename),
    path.resolve(process.cwd(), '.open-next', 'assets', 'cheatsheets', 'pdf', filename),
    path.resolve(process.cwd(), '.build-artifacts', 'r2', 'cheat-sheets', 'pdf', filename),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      const fileBuffer = fs.readFileSync(candidate);
      const headers = new Headers();
      setCorsHeaders(headers, request);
      headers.set('Content-Type', 'application/pdf');
      headers.set('Content-Disposition', disposition);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Content-Length', fileBuffer.length.toString());
      return new NextResponse(fileBuffer, { status: 200, headers });
    }
  }

  return NextResponse.json({ error: 'PDF file not found on disk' }, { status: 404 });
}
