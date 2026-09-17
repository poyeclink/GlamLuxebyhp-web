import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

// Dominio público desde el que se sirven los objetos (custom domain o r2.dev), sin slash final.
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export function r2PublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}
