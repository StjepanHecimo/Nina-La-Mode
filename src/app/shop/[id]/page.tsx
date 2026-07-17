import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { formatPrice, products as fallbackProducts } from "@/data/products";
import { getProductById, getProducts } from "@/lib/products";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() { return fallbackProducts.map(product => ({ id: product.id })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return product ? {
    title: `${product.name} — Tall Women's Wide-Leg Trousers`,
    description: product.description,
    alternates: { canonical: `/shop/${product.id}` },
    openGraph: { type: "website", url: `/shop/${product.id}`, title: product.name, description: product.description, images: product.images.map((url) => ({ url, alt: product.name })) },
    twitter: { card: "summary_large_image", title: product.name, description: product.description, images: [product.image] },
  } : {};
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const products = await getProducts();
  const related = products.filter(item => item.id !== product.id && item.category === product.category).slice(0, 3);
  const fallback = products.filter(item => item.id !== product.id).slice(0, 3);
  const productUrl = `https://www.ninilamode.com/shop/${product.id}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((image) => `https://www.ninilamode.com${image}`),
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: "Nina La Mode" },
    color: product.color,
    material: product.material,
    size: product.sizes,
    audience: { "@type": "PeopleAudience", suggestedGender: "female", suggestedMinAge: 18 },
    offers: { "@type": "Offer", url: productUrl, priceCurrency: "GBP", price: (product.priceCents / 100).toFixed(2), availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition", seller: { "@type": "Organization", name: "Nina La Mode" } },
  };

  return <main className="product-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <Link className="back-link" href="/shop"><span>←</span> Back to shop</Link>
    <section className="product-detail">
      <ProductGallery images={product.images?.length ? product.images : [product.image]} name={product.name} />
      <div className="detail-info"><p className="kicker">{product.category} · 2026 Collection</p><h1>{product.name}</h1><p className="detail-price">{formatPrice(product.priceCents)}</p><p className="detail-description">{product.description}</p>
        <div className="detail-block"><p className="detail-label">Available colour</p><div className="color-options">{product.colors.map((color, index) => <span key={color.name} className={index === 0 ? "selected" : ""}><i style={{ backgroundColor: color.hex }} />{color.name}</span>)}</div></div>
        <div className="detail-specs"><div className="detail-block"><p className="detail-label">Material</p><p>{product.material}</p></div>{product.inseam && <div className="detail-block"><p className="detail-label">Inseam</p><p>{product.inseam}</p></div>}{product.fit && <div className="detail-block"><p className="detail-label">Fit</p><p>{product.fit}</p></div>}</div>
        <div className="detail-block"><p className="detail-label">UK sizes</p><div className="sizes">{product.sizes.map(size => <button key={size} type="button">{size}</button>)}</div></div>
        <button className="button detail-cta" type="button">Add to bag <ArrowIcon /></button><p className="delivery-note">Free UK delivery over £100 · Returns within 14 days</p>
      </div>
    </section>
    {fallback.length > 0 ? <section className="continue-shopping"><div className="section-heading"><div><p className="kicker">Keep exploring</p><h2>You may also <em>love.</em></h2></div><Link className="text-link" href="/shop">View the collection <ArrowIcon /></Link></div><div className="product-grid">{(related.length >= 3 ? related : fallback).map(item => <ProductCard key={item.id} product={item}/>)}</div></section> : <section className="product-promise"><p className="kicker light">The Nina La Mode signature</p><h2>Cut for height.<br/><em>Made for every day.</em></h2><p>From the morning commute to evening plans, Classic Tall trousers follow your rhythm without compromising comfort or elegance.</p><Link className="text-link light" href="/shop">Back to shop <ArrowIcon /></Link></section>}
  </main>;
}
