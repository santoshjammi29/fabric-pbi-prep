import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const objectKey = pathSegments.join('/');

  // 1. Try Cloudflare Worker R2 Bucket
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const cloudflareContext = await getCloudflareContext({ async: true });
    const bucket = (cloudflareContext?.env as any)?.ARTIFACTS_BUCKET as R2Bucket | undefined;

    if (bucket) {
      const object = await bucket.get(objectKey);
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Access-Control-Allow-Origin', '*');

        if (objectKey.endsWith('manifest.json')) {
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

  // 2. Local Fallback for Dev Server & Vitest Testing
  const localCandidates = [
    path.join(process.cwd(), '.build-artifacts', 'r2', objectKey),
    path.join(process.cwd(), 'public', '_artifacts', objectKey),
  ];

  for (const localPath of localCandidates) {
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      const fileBuffer = fs.readFileSync(localPath);
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');

      if (objectKey.endsWith('.json')) {
        headers.set('Content-Type', 'application/json; charset=utf-8');
      } else if (objectKey.endsWith('.webp')) {
        headers.set('Content-Type', 'image/webp');
      } else if (objectKey.endsWith('.pdf')) {
        headers.set('Content-Type', 'application/pdf');
      }

      if (objectKey.endsWith('manifest.json')) {
        headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      } else {
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      }

      return new NextResponse(fileBuffer, { status: 200, headers });
    }
  }

  return NextResponse.json({ error: `Artifact not found: ${objectKey}` }, { status: 404 });
}
