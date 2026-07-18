"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

const ukSizes = ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20", "UK 22", "UK 24"];

type SubmitAction = "draft" | "publish";

export function AdminProductForm({ email }: { email: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [action, setAction] = useState<SubmitAction | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const previews = useMemo(() => files.map(file => ({ name: file.name, url: URL.createObjectURL(file) })), [files]);

  async function uploadImages() {
    const urls: string[] = [];
    for (const file of files) {
      const body = new FormData();
      body.set("image", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || `Could not upload ${file.name}.`);
      urls.push(data.url);
    }
    return urls;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const submitAction = submitter?.value === "publish" ? "publish" : "draft";
    if (!files.length) { setError("Add at least one product image."); return; }
    if (submitAction === "publish" && !window.confirm("Publish this product now and email all newsletter subscribers? This notification can only be sent once.")) return;
    setAction(submitAction);
    setError("");
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const selectedSizes = form.getAll("sizes").map(String);
      if (!selectedSizes.length) throw new Error("Select at least one UK size.");
      const price = Number(form.get("price"));
      if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a valid price in GBP.");
      const images = await uploadImages();
      const body = {
        action: submitAction,
        id: String(form.get("id")), name: String(form.get("name")), category: String(form.get("category")), priceCents: Math.round(price * 100),
        image: images[0], images, color: String(form.get("colourName")), colors: [{ name: String(form.get("colourName")), hex: String(form.get("colourHex")) }],
        material: String(form.get("material")), description: String(form.get("description")), sizes: selectedSizes,
        inseam: String(form.get("inseam") || ""), fit: String(form.get("fit") || ""), isNew: true,
      };
      const response = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json() as { error?: string; newsletter?: string };
      if (!response.ok) throw new Error(data.error || "The product could not be saved.");
      if (submitAction === "draft") setMessage("Draft saved. It is not visible in the shop and no newsletter was sent.");
      else if (data.newsletter === "sent") setMessage("Product published and the new-arrival newsletter was sent.");
      else if (data.newsletter === "no_subscribers") setMessage("Product published. There are currently no newsletter subscribers.");
      else setMessage("Product published. Newsletter delivery is waiting for the Brevo API configuration.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The product could not be saved.");
    } finally { setAction(null); }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return <>
    <div className="admin-toolbar"><span>Signed in as {email}</span><button type="button" onClick={logout}>Sign out</button></div>
    <form className="admin-product-form" onSubmit={submit}>
      <section><h2>Product details</h2><div className="field-row"><label>Product name<input name="name" required onChange={(event) => { const id = document.querySelector<HTMLInputElement>("#product-id"); if (id) id.value = event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }} /></label><label>URL slug<input id="product-id" name="id" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label></div><div className="field-row"><label>Category<select name="category" defaultValue="Trousers" required><option>Trousers</option><option>Dresses</option><option>Blouses</option></select></label><label>Price in GBP<input name="price" type="number" min="0.01" step="0.01" placeholder="40.00" required /></label></div><label>Description<textarea name="description" minLength={20} maxLength={2000} rows={6} required /></label></section>
      <section><h2>Product specifications</h2><div className="field-row"><label>Colour name<input name="colourName" placeholder="Deep Green" required /></label><label>Colour swatch<input name="colourHex" type="color" defaultValue="#173f48" required /></label></div><label>Material<input name="material" placeholder="100% cotton" required /></label><div className="field-row"><label>Inseam<input name="inseam" placeholder="88 cm" /></label><label>Fit<input name="fit" placeholder="Classic high waist with a wide-leg silhouette" /></label></div><fieldset className="admin-sizes"><legend>Available UK sizes</legend>{ukSizes.map(size => <label key={size}><input name="sizes" type="checkbox" value={size} />{size}</label>)}</fieldset></section>
      <section><h2>Product images</h2><p>Upload JPG, PNG or WebP files up to 6 MB each. The first image becomes the main product image.</p><label className="admin-file-picker">Choose images<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} /></label>{previews.length > 0 && <div className="admin-image-previews">{previews.map(preview => <figure key={preview.url}><Image src={preview.url} alt="" width={150} height={190} unoptimized /><figcaption>{preview.name}</figcaption></figure>)}</div>}</section>
      <section className="admin-publish"><h2>Save or publish</h2><p><strong>Save draft</strong> keeps the product private. <strong>Publish and notify subscribers</strong> makes it visible and immediately sends one Brevo new-arrival campaign.</p>{error && <p className="checkout-error" role="alert">{error}</p>}{message && <p className="admin-success" role="status">{message}</p>}<div><button className="button secondary" type="submit" value="draft" disabled={Boolean(action)}>{action === "draft" ? "Saving…" : "Save draft"}</button><button className="button" type="submit" value="publish" disabled={Boolean(action)}>{action === "publish" ? "Publishing…" : "Publish and notify subscribers"}</button></div></section>
    </form>
  </>;
}
