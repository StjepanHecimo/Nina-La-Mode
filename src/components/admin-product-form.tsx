"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import type { AdminProduct } from "@/lib/admin-products";

const ukSizes = ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20", "UK 22", "UK 24"];
type SubmitAction = "save" | "draft" | "coming_soon" | "publish";

export function AdminProductForm({ email, initialProduct }: { email: string; initialProduct?: AdminProduct }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(initialProduct?.images ?? []);
  const [action, setAction] = useState<SubmitAction | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const previews = useMemo(() => files.map(file => ({ name: file.name, url: URL.createObjectURL(file) })), [files]);
  const editing = Boolean(initialProduct);

  async function uploadImages() {
    const urls: string[] = [];
    for (const file of files) {
      const body = new FormData();
      body.set("image", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({})) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || `Could not upload ${file.name}.`);
      urls.push(data.url);
    }
    return urls;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const submitAction: SubmitAction = submitter?.value === "publish" ? "publish" : submitter?.value === "coming_soon" ? "coming_soon" : submitter?.value === "save" ? "save" : "draft";
    if (!existingImages.length && !files.length) { setImageError(true); setError("Add at least one product image."); return; }
    if (submitAction === "publish" && !window.confirm("Publish this product now and email all newsletter subscribers? This notification can only be sent once.")) return;
    setAction(submitAction);
    setError("");
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const selectedSizes = form.getAll("sizes").map(String);
      if (!selectedSizes.length) { setSizeError(true); throw new Error("Select at least one UK size."); }
      const price = Number(form.get("price"));
      if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid price in GBP.");
      const uploaded = await uploadImages();
      const images = [...existingImages, ...uploaded];
      const product = {
        id: String(form.get("id")), name: String(form.get("name")), category: String(form.get("category")), priceCents: Math.round(price * 100),
        image: images[0], images, color: String(form.get("colourName")), colors: [{ name: String(form.get("colourName")), hex: String(form.get("colourHex")) }],
        material: String(form.get("material")), description: String(form.get("description")), sizes: selectedSizes,
        inseam: String(form.get("inseam") || ""), fit: String(form.get("fit") || ""), isNew: true, availability: initialProduct?.availability ?? "available",
      };
      const endpoint = submitAction === "save" ? `/api/admin/products/${encodeURIComponent(product.id)}` : "/api/products";
      const response = await fetch(endpoint, { method: submitAction === "save" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(submitAction === "save" ? product : { ...product, action: submitAction }) });
      const data = await response.json() as { error?: string; newsletter?: string; warning?: string };
      if (!response.ok) throw new Error(data.error || "The product could not be saved.");
      setExistingImages(images);
      setFiles([]);
      if (submitAction === "save") setMessage("Changes saved. Newsletter subscribers were not notified again.");
      else if (submitAction === "draft") setMessage("Draft saved. It is not visible in the shop and no newsletter was sent.");
      else if (submitAction === "coming_soon") setMessage("Product published as Coming soon and is available for pre-order. No newsletter was sent.");
      else if (data.newsletter === "sent") setMessage("Product published and the new-arrival newsletter was sent.");
      else if (data.newsletter === "no_subscribers") setMessage("Product published. There are currently no newsletter subscribers.");
      else if (data.newsletter === "failed") setError(data.warning || "Product published, but the newsletter was not sent. Check the Brevo configuration.");
      else setMessage("Product published. Newsletter delivery is waiting for the Brevo API configuration.");
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The product could not be saved."); }
    finally { setAction(null); }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const primaryColour = initialProduct?.colors[0];
  return <>
    <div className="admin-toolbar"><span>Signed in as {email}</span><nav><Link href="/admin/products">Products</Link><Link href="/admin/products/new">Add product</Link><button type="button" onClick={logout}>Sign out</button></nav></div>
    <form className="admin-product-form" onSubmit={submit} onInvalid={() => setError("Please complete the highlighted required fields.")}>
      <section><h2>Product details</h2><div className="field-row"><label>Product name<input name="name" defaultValue={initialProduct?.name} required onChange={(event) => { if (editing) return; const id = document.querySelector<HTMLInputElement>("#product-id"); if (id) id.value = event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }} /></label><label>URL slug<input id="product-id" name="id" defaultValue={initialProduct?.id} readOnly={editing} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label></div><div className="field-row"><label>Category<select name="category" defaultValue={initialProduct?.category ?? "Trousers"} required><option>Trousers</option><option>Dresses</option><option>Blouses</option></select></label><label>Price in GBP<input name="price" type="number" min="0.01" step="0.01" defaultValue={initialProduct ? (initialProduct.priceCents / 100).toFixed(2) : undefined} placeholder="40.00" required /></label></div><label>Description<textarea name="description" defaultValue={initialProduct?.description} minLength={20} maxLength={2000} rows={6} required /></label></section>
      <section><h2>Product specifications</h2><div className="field-row"><label>Colour name<input name="colourName" defaultValue={primaryColour?.name ?? initialProduct?.color} placeholder="Deep Green" required /></label><label>Colour swatch<input name="colourHex" type="color" defaultValue={primaryColour?.hex ?? "#173f48"} required /></label></div><label>Material<input name="material" defaultValue={initialProduct?.material} placeholder="100% cotton" required /></label><div className="field-row"><label>Inseam<input name="inseam" defaultValue={initialProduct?.inseam} placeholder="88 cm" /></label><label>Fit<input name="fit" defaultValue={initialProduct?.fit} placeholder="Classic high waist with a wide-leg silhouette" /></label></div><fieldset className={`admin-sizes${sizeError ? " invalid" : ""}`}><legend>Available UK sizes</legend>{ukSizes.map(size => <label key={size}><input name="sizes" type="checkbox" value={size} defaultChecked={initialProduct?.sizes.includes(size)} onChange={() => setSizeError(false)} />{size}</label>)}{sizeError && <p className="admin-field-error">Select at least one UK size.</p>}</fieldset></section>
      <section className={`admin-images-section${imageError ? " invalid" : ""}`}><h2>Product images</h2><p>The first image is the main image. Remove unwanted images or add new JPG, PNG or WebP files up to 6 MB each.</p>{imageError && <p className="admin-field-error">Add at least one product image.</p>}{existingImages.length > 0 && <div className="admin-image-previews">{existingImages.map((url, index) => <figure key={url}><Image src={url} alt="" width={150} height={190} /><figcaption>{index === 0 ? "Main image" : `Image ${index + 1}`}</figcaption><div>{index > 0 && <button type="button" onClick={() => setExistingImages(current => [url, ...current.filter(item => item !== url)])}>Make main</button>}<button type="button" className="danger" onClick={() => setExistingImages(current => current.filter(item => item !== url))}>Remove</button></div></figure>)}</div>}<label className="admin-file-picker">Add images<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { setFiles(Array.from(event.target.files || [])); setImageError(false); }} /></label>{previews.length > 0 && <div className="admin-image-previews new-images">{previews.map(preview => <figure key={preview.url}><Image src={preview.url} alt="" width={150} height={190} unoptimized /><figcaption>{preview.name}</figcaption></figure>)}</div>}</section>
      <section className="admin-publish"><h2>{editing ? "Save changes" : "Save or publish"}</h2><p>{editing && initialProduct?.active ? "Save updates without sending another newsletter." : <><strong>Save draft</strong> keeps the product private. <strong>Coming soon</strong> publishes it for pre-order without notifying subscribers. <strong>Publish and notify subscribers</strong> makes it available now and sends the new-arrival email.</>}</p>{error && <p className="checkout-error" role="alert">{error}</p>}{message && <p className="admin-success" role="status">{message}</p>}<div>{editing && initialProduct?.active ? <button className="button" type="submit" value="save" disabled={Boolean(action)}>{action === "save" ? "Saving…" : "Save changes"}</button> : <><button className="button secondary" type="submit" value={editing ? "save" : "draft"} disabled={Boolean(action)}>{action === "save" || action === "draft" ? "Saving…" : editing ? "Save draft changes" : "Save draft"}</button>{!editing && <button className="button secondary coming-soon-action" type="submit" value="coming_soon" disabled={Boolean(action)}>{action === "coming_soon" ? "Publishing…" : "Publish as coming soon"}</button>}<button className="button" type="submit" value="publish" disabled={Boolean(action)}>{action === "publish" ? "Publishing…" : "Publish and notify subscribers"}</button></>}</div></section>
    </form>
  </>;
}
