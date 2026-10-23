// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { GET, OPTIONS } from '@/app/api/download/pdf/[filename]/route';
import { NextRequest } from 'next/server';

describe('PDF Download Route API (/api/download/pdf/[filename])', () => {
  it('handles OPTIONS preflight with CORS headers for allowed origins', async () => {
    const req = new NextRequest(
      new Request('http://localhost:3000/api/download/pdf/databricks_master_cheatsheet.pdf', {
        method: 'OPTIONS',
        headers: { origin: 'https://moderndataengineer.uk' },
      })
    );
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://moderndataengineer.uk');
  });

  it('rejects unapproved or non-whitelisted files with 404', async () => {
    const req = new NextRequest('http://localhost:3000/api/download/pdf/malicious_file.exe');
    const res = await GET(req, { params: Promise.resolve({ filename: 'malicious_file.exe' }) });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain('not found');
  });

  it('serves databricks_master_cheatsheet.pdf with attachment Content-Disposition', async () => {
    const req = new NextRequest('http://localhost:3000/api/download/pdf/databricks_master_cheatsheet.pdf');
    const res = await GET(req, { params: Promise.resolve({ filename: 'databricks_master_cheatsheet.pdf' }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('attachment; filename="databricks_master_cheatsheet.pdf"');
  });

  it('serves incident_runbooks.pdf with attachment Content-Disposition', async () => {
    const req = new NextRequest('http://localhost:3000/api/download/pdf/incident_runbooks.pdf');
    const res = await GET(req, { params: Promise.resolve({ filename: 'incident_runbooks.pdf' }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('attachment; filename="incident_runbooks.pdf"');
  });

  it('serves lakehouse_enterprise_master_reference.pdf with attachment Content-Disposition', async () => {
    const req = new NextRequest('http://localhost:3000/api/download/pdf/lakehouse_enterprise_master_reference.pdf');
    const res = await GET(req, { params: Promise.resolve({ filename: 'lakehouse_enterprise_master_reference.pdf' }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('attachment; filename="lakehouse_enterprise_master_reference.pdf"');
  });

  it('respects ?inline=true query param for in-browser viewing', async () => {
    const req = new NextRequest('http://localhost:3000/api/download/pdf/databricks_sparksql_cheatsheet.pdf?inline=true');
    const res = await GET(req, { params: Promise.resolve({ filename: 'databricks_sparksql_cheatsheet.pdf' }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Disposition')).toContain('inline; filename="databricks_sparksql_cheatsheet.pdf"');
  });
});
