import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;

  // Strict path traversal defense: validate all path segments
  if (!pathSegments || pathSegments.length === 0) {
    return NextResponse.json({ error: 'Artifact path is required' }, { status: 400 });
  }

  for (const segment of pathSegments) {
    const decoded = decodeURIComponent(segment);
    if (
      decoded === '..' ||
      decoded === '.' ||
      decoded.includes('/') ||
      decoded.includes('\\') ||
      decoded.includes('\0')
    ) {
      return NextResponse.json({ error: 'Path traversal attempt detected' }, { status: 400 });
    }
  }

  const normalizedKey = path.posix.normalize(pathSegments.join('/'));
  if (normalizedKey.startsWith('..') || path.posix.isAbsolute(normalizedKey)) {
    return NextResponse.json({ error: 'Path traversal attempt detected' }, { status: 400 });
  }

  // 1. Try Cloudflare Worker R2 Bucket
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const cloudflareContext = await getCloudflareContext({ async: true });
    const bucket = (cloudflareContext?.env as any)?.ARTIFACTS_BUCKET as R2Bucket | undefined;

    if (bucket) {
      const object = await bucket.get(normalizedKey);
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        setCorsHeaders(headers, request);

        if (normalizedKey.endsWith('manifest.json')) {
          headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        } else {
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        }

        return new NextResponse(object.body as any, { status: 200, headers });
      }
    }
  } catch {
    // getCloudflareContext is not available in Node.js dev/build context
  }

  // 2. Local Fallback for Dev Server & Vitest Testing (Strictly contained)
  const allowedBaseDirs = [
    path.resolve(process.cwd(), '.build-artifacts', 'r2'),
    path.resolve(process.cwd(), 'public', '_artifacts'),
  ];

  for (const baseDir of allowedBaseDirs) {
    const candidatePath = path.resolve(baseDir, normalizedKey);
    const rel = path.relative(baseDir, candidatePath);

    // Guard against traversing out of baseDir
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      return NextResponse.json({ error: 'Path traversal attempt detected' }, { status: 400 });
    }

    if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      const fileBuffer = fs.readFileSync(candidatePath);
      const headers = new Headers();
      setCorsHeaders(headers, request);

      if (normalizedKey.endsWith('.json')) {
        headers.set('Content-Type', 'application/json; charset=utf-8');
      } else if (normalizedKey.endsWith('.webp')) {
        headers.set('Content-Type', 'image/webp');
      } else if (normalizedKey.endsWith('.pdf')) {
        headers.set('Content-Type', 'application/pdf');
      }

      if (normalizedKey.endsWith('manifest.json')) {
        headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      } else {
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      }

      return new NextResponse(fileBuffer, { status: 200, headers });
    }
  }

  return NextResponse.json({ error: `Artifact not found: ${normalizedKey}` }, { status: 404 });
}
