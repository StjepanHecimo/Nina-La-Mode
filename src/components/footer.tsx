import Link from "next/link";
import { InstagramIcon, MailIcon } from "./icons";

export function Footer() {
  return <footer className="footer">
    <div className="footer-brand"><Link className="logo" href="/">NINA <span>LA MODE</span></Link><p>Odjeća koja se prilagođava tvom danu — i ostaje tvoja godinama.</p></div>
    <div><p className="footer-title">Istraži</p><Link href="/shop">Shop</Link><Link href="/about">O nama</Link><Link href="/contact">Kontakt</Link></div>
    <div><p className="footer-title">Informacije</p><a href="#">Dostava i povrati</a><a href="#">Vodič kroz veličine</a><a href="#">Uvjeti kupnje</a></div>
    <div><p className="footer-title">Prati nas</p><div className="socials"><a href="#" aria-label="Instagram"><InstagramIcon /></a><Link href="/contact" aria-label="Email"><MailIcon /></Link></div></div>
    <p className="copyright">© {new Date().getFullYear()} Nina La Mode. Sva prava pridržana.</p>
  </footer>;
}
