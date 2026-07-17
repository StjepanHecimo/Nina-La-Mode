import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { Newsletter } from "@/components/newsletter";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";

export const revalidate = 300;

export default async function Home() {
  const products = await getProducts();
  return <main>
    <section className="hero">
      <Image src="/images/hero-tall-trousers.png" alt="Classic Tall zelene hlače za visoke žene" fill priority sizes="100vw" />
      <div className="hero-content"><p className="kicker">Dizajnirano za visoke žene</p><h1>Odjeća za <em>tvoj</em> ritam.</h1><p>Klasične hlače visokog struka, pune dužine i bezvremenske siluete — krojene da pristaju upravo tebi.</p><Link className="button" href="/shop/classic-tall-trousers">Otkrij hlače <ArrowIcon /></Link></div>
      <p className="hero-index">N° 01 — Classic Tall</p>
    </section>
    <section className="values" aria-label="Naše vrijednosti">
      <article><span>01</span><div><h3>Kroj za visoke žene</h3><p>Visoki struk i 88 cm unutarnje dužine za skladnu, punu siluetu.</p></div></article>
      <article><span>02</span><div><h3>100% pamuk</h3><p>Prirodno prozračan i udoban materijal za sva godišnja doba.</p></div></article>
      <article><span>03</span><div><h3>Bezvremenski stil</h3><p>Široke nogavice koje lako prelaze iz dnevnog u večernji look.</p></div></article>
    </section>
    <section className="featured section single-feature"><div className="section-heading"><div><p className="kicker">Naš potpisni komad</p><h2>Jedne hlače.<br/><em>Bezbroj prilika.</em></h2></div><Link className="text-link" href="/shop/classic-tall-trousers">Detalji proizvoda <ArrowIcon /></Link></div><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="manifesto"><p className="manifesto-small">Naša filozofija</p><blockquote>Ne odijevamo trenutak.<br/>Odijevamo <em>ženu koja traje.</em></blockquote><Link className="text-link light" href="/about">Upoznaj našu priču <ArrowIcon /></Link></section>
    <Newsletter />
  </main>;
}
