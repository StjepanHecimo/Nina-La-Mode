import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";
import { parseProductInput } from "@/lib/product-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

async function authorised() { return Boolean(await getAdminSession()); }

export async function PUT(request: Request, { params }: Context) {
  if (!await authorised()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await params;
    const product = parseProductInput(await request.json());
    if (!product || product.id !== id) return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
    const ref = db.collection("products").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    const previousImages: string[] = Array.isArray(existing.data()?.images) ? existing.data()!.images.filter((item: unknown): item is string => typeof item === "string") : [];
    const { id: _id, ...data } = product;
    void _id;
    await ref.set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    const removedPaths = previousImages.filter(url => !product.images.includes(url)).map(storagePath).filter((path): path is string => Boolean(path));
    const storage = getAdminStorage();
    if (storage) await Promise.all(removedPaths.map(path => storage.bucket().file(path).delete({ ignoreNotFound: true }).catch(error => console.error("Storage cleanup failed", path, error))));
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${id}`);
    return NextResponse.json({ updated: true, productId: id });
  } catch (error) {
    console.error("Admin product update failed", error);
    return NextResponse.json({ error: "The product could not be updated." }, { status: 500 });
  }
}

function storagePath(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "firebasestorage.googleapis.com") return null;
    const match = parsed.pathname.match(/\/o\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch { return null; }
}

export async function DELETE(_request: Request, { params }: Context) {
  if (!await authorised()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await params;
    const ref = db.collection("products").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    const images: string[] = Array.isArray(existing.data()?.images) ? existing.data()!.images.filter((item: unknown): item is string => typeof item === "string") : [];
    await ref.delete();
    const storage = getAdminStorage();
    if (storage) await Promise.all(images.map(storagePath).filter((path): path is string => Boolean(path)).map(path => storage.bucket().file(path).delete({ ignoreNotFound: true }).catch(error => console.error("Storage cleanup failed", path, error))));
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${id}`);
    return NextResponse.json({ deleted: true, productId: id });
  } catch (error) {
    console.error("Admin product deletion failed", error);
    return NextResponse.json({ error: "The product could not be deleted." }, { status: 500 });
  }
}
