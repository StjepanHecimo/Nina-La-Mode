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
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    const message = error instanceof Error ? error.message : "";
    if (code === "404" || message.includes("bucket does not exist")) {
      return NextResponse.json({ error: "Firebase Storage is not active for this project. Open Firebase Console → Storage, select Get started, then try again." }, { status: 503 });
    }
    if (code === "403" || message.includes("permission")) {
      return NextResponse.json({ error: "Firebase rejected the upload. Check that the Admin service account can access Firebase Storage." }, { status: 503 });
    }
    return NextResponse.json({ error: "The image could not be uploaded. Please try again." }, { status: 500 });
  }
}
