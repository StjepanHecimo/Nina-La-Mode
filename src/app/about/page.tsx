import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us — Designed for Tall Women",
  description: "Discover why Nina La Mode creates thoughtfully proportioned, full-length clothing for tall women.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Nina La Mode", description: "Fashion designed around the proportions of tall women.", url: "/about", images: ["/images/hero-tall-trousers-hd-v2.png"] },
};

export default function AboutPage() {
  return <main className="page-main"><section className="about-hero"><div><p className="kicker">Our story</p><h1>Fashion that finally fits <em>your height.</em></h1><p>Nina La Mode began with one simple belief: tall women deserve trousers that fit without compromise, alterations or ankles left uncovered.</p></div><div className="about-image"><Image src="/images/hero-tall-trousers-hd-v2.png" alt="Nina La Mode Classic Tall trousers" fill sizes="50vw" /></div></section><section className="story"><p className="story-lead">Designed with purpose.</p><div><p>Classic Tall combines a high waist, full length and wide leg in a silhouette that feels as comfortable as it looks polished. Every detail serves a purpose — from the 88 cm inseam to naturally breathable cotton.</p><p>We are not creating a piece for one occasion. We are creating a dependable wardrobe foundation for work, weekends and everything in between.</p></div></section><section className="numbers"><div><strong>88</strong><span>cm inseam</span></div><div><strong>100%</strong><span>Natural cotton</span></div><div><strong>12–20</strong><span>UK sizes</span></div></section></main>;
}
