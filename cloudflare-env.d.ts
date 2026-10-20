interface R2HttpMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
  writeHttpMetadata(headers: Headers): void;
}

interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
  blob(): Promise<Blob>;
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(key: string, value: any): Promise<R2Object>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: any): Promise<any>;
}

interface CloudflareEnv {
  ASSETS: { fetch: typeof fetch };
  WORKER_SELF_REFERENCE: { fetch: typeof fetch };
  NEXT_INC_CACHE_R2_BUCKET: R2Bucket;
  ARTIFACTS_BUCKET: R2Bucket;
  NEXT_PUBLIC_CDN_URL: string;
  ARTIFACT_VERSION: string;
}
