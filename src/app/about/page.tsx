import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "O nama", description: "Priča iza Nina La Mode brenda." };

export default function AboutPage() {
  return <main className="page-main"><section className="about-hero"><div><p className="kicker">Naša priča</p><h1>Moda koja konačno prati <em>tvoju visinu.</em></h1><p>Nina La Mode nastala je iz jednostavne ideje: visoke žene zaslužuju hlače koje pristaju bez kompromisa, prepravaka i prekratkih nogavica.</p></div><div className="about-image"><Image src="/images/hero-tall-trousers.png" alt="Nina La Mode Classic Tall hlače" fill sizes="50vw" /></div></section><section className="story"><p className="story-lead">Dizajnirano s razlogom.</p><div><p>Classic Tall spaja visoki struk, punu dužinu i široku nogavicu u siluetu koja je jednako udobna koliko i elegantna. Svaki detalj ima svrhu — od 88 cm unutarnje dužine do prirodnog, prozračnog pamuka.</p><p>Ne stvaramo komad za jednu priliku. Stvaramo pouzdanu osnovu garderobe koju možeš nositi na posao, u grad ili na posebno događanje.</p></div></section><section className="numbers"><div><strong>88</strong><span>cm unutarnje dužine</span></div><div><strong>100%</strong><span>Prirodni pamuk</span></div><div><strong>12–20</strong><span>UK veličine</span></div></section></main>;
}
