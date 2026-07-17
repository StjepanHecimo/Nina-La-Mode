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
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const products = await getProducts();
  const related = products.filter(item => item.id !== product.id && item.category === product.category).slice(0, 3);
  const fallback = products.filter(item => item.id !== product.id).slice(0, 3);

  return <main className="product-page">
    <Link className="back-link" href="/shop"><span>←</span> Natrag na shop</Link>
    <section className="product-detail">
      <ProductGallery images={product.images?.length ? product.images : [product.image]} name={product.name} />
      <div className="detail-info"><p className="kicker">{product.category} · Kolekcija 2026</p><h1>{product.name}</h1><p className="detail-price">{formatPrice(product.priceCents)}</p><p className="detail-description">{product.description}</p>
        <div className="detail-block"><p className="detail-label">Dostupne boje</p><div className="color-options">{product.colors.map((color, index) => <span key={color.name} className={index === 0 ? "selected" : ""}><i style={{ backgroundColor: color.hex }} />{color.name}</span>)}</div></div>
        <div className="detail-specs"><div className="detail-block"><p className="detail-label">Materijal</p><p>{product.material}</p></div>{product.inseam && <div className="detail-block"><p className="detail-label">Unutarnja dužina</p><p>{product.inseam}</p></div>}{product.fit && <div className="detail-block"><p className="detail-label">Kroj</p><p>{product.fit}</p></div>}</div>
        <div className="detail-block"><p className="detail-label">Veličine</p><div className="sizes">{product.sizes.map(size => <button key={size} type="button">{size}</button>)}</div></div>
        <button className="button detail-cta" type="button">Dodaj u košaricu <ArrowIcon /></button><p className="delivery-note">Besplatna dostava za narudžbe iznad £100 · Povrat unutar 14 dana</p>
      </div>
    </section>
    {fallback.length > 0 ? <section className="continue-shopping"><div className="section-heading"><div><p className="kicker">Nastavi istraživati</p><h2>Možda ti se <em>svidi.</em></h2></div><Link className="text-link" href="/shop">Cijela kolekcija <ArrowIcon /></Link></div><div className="product-grid">{(related.length >= 3 ? related : fallback).map(item => <ProductCard key={item.id} product={item}/>)}</div></section> : <section className="product-promise"><p className="kicker light">Nina La Mode potpis</p><h2>Krojene za visinu.<br/><em>Stvorene za svaki dan.</em></h2><p>Od uredskog jutra do večernjeg izlaska — Classic Tall hlače prate tvoj ritam bez kompromisa između udobnosti i elegancije.</p><Link className="text-link light" href="/shop">Natrag u shop <ArrowIcon /></Link></section>}
  </main>;
}
