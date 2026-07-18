import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAdminStorage } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(request: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const storage = getAdminStorage();
  if (!storage) return NextResponse.json({ error: "Image storage is not configured." }, { status: 503 });
  try {
    const form = await request.formData();
    const upload = form.get("image");
    if (!(upload instanceof File) || !allowedTypes.has(upload.type) || upload.size < 1 || upload.size > MAX_BYTES) {
      return NextResponse.json({ error: "Choose a JPG, PNG or WebP image up to 6 MB." }, { status: 400 });
    }
    const extension = upload.type === "image/png" ? "png" : upload.type === "image/webp" ? "webp" : "jpg";
    const token = randomUUID();
    const path = `products/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const bucket = storage.bucket();
    const file = bucket.file(path);
    await file.save(Buffer.from(await upload.arrayBuffer()), {
      resumable: false,
      contentType: upload.type,
      metadata: { cacheControl: "public,max-age=31536000,immutable", metadata: { firebaseStorageDownloadTokens: token } },
    });
    const url = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket.name)}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    return NextResponse.json({ url, path });
  } catch (error) {
    console.error("Admin image upload failed", error);
    return NextResponse.json({ error: "The image could not be uploaded." }, { status: 500 });
  }
}

