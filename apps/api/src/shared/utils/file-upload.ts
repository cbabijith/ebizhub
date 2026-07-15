import { env } from "../../config/env.js";

export interface UploadedFile {
  url: string;
  name: string;
}

function generateUrl(bucket: string, ownerId: string, file: File): string {
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
  const path = `${ownerId}_${Date.now()}_${safeName}`;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function uploadFile(bucket: string, ownerId: string, file: File): UploadedFile {
  return {
    url: generateUrl(bucket, ownerId, file),
    name: file.name,
  };
}
