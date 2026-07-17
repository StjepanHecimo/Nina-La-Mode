import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { Newsletter } from "@/components/newsletter";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";

export const revalidate = 300;

export default async function Home() {
  const products = await getProducts();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://www.ninilamode.com/#organization", name: "Nina La Mode", url: "https://www.ninilamode.com", logo: "https://www.ninilamode.com/images/classic-tall-trousers.png", email: "info@ninilamode.com" },
      { "@type": "WebSite", "@id": "https://www.ninilamode.com/#website", url: "https://www.ninilamode.com", name: "Nina La Mode", inLanguage: "en-GB", publisher: { "@id": "https://www.ninilamode.com/#organization" } },
    ],
  };
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <section className="hero">
      <Image src="/images/hero-tall-trousers-hd.png" alt="Classic Tall high-waisted green trousers for tall women" fill priority quality={95} sizes="100vw" />
      <div className="hero-content"><p className="kicker">Designed for tall women</p><h1>Made for <em>your</em> stride.</h1><p>Classic high-waisted trousers with a full-length, timeless silhouette — tailored to fit the way tall women deserve.</p><Link className="button" href="/shop/classic-tall-trousers">Discover the trousers <ArrowIcon /></Link></div>
      <p className="hero-index">N° 01 — Classic Tall</p>
    </section>
    <section className="values" aria-label="Our values">
      <article><span>01</span><div><h3>Cut for tall women</h3><p>A high waist and 88 cm inseam create an elegant, full-length silhouette.</p></div></article>
      <article><span>02</span><div><h3>100% cotton</h3><p>Naturally breathable comfort designed to work through every season.</p></div></article>
      <article><span>03</span><div><h3>Timeless style</h3><p>A wide leg that moves effortlessly from daytime to evening.</p></div></article>
    </section>
    <section className="featured section single-feature"><div className="section-heading"><div><p className="kicker">Our signature piece</p><h2>One pair.<br/><em>Endless possibilities.</em></h2></div><Link className="text-link" href="/shop/classic-tall-trousers">Product details <ArrowIcon /></Link></div><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="manifesto"><p className="manifesto-small">Our philosophy</p><blockquote>We do not dress a moment.<br/>We dress <em>the woman who lasts.</em></blockquote><Link className="text-link light" href="/about">Discover our story <ArrowIcon /></Link></section>
    <Newsletter />
  </main>;
}
