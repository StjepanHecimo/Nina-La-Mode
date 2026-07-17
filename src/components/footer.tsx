import Link from "next/link";
import { InstagramIcon, MailIcon } from "./icons";

export function Footer() {
  return <footer className="footer">
    <div className="footer-brand"><Link className="logo" href="/">NINA <span>LA MODE</span></Link><p>Clothing made to fit your day — and stay in your wardrobe for years.</p></div>
    <div><p className="footer-title">Explore</p><Link href="/shop">Shop</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></div>
    <div><p className="footer-title">Information</p><a href="#">Delivery & returns</a><a href="#">Size guide</a><a href="#">Terms & conditions</a></div>
    <div><p className="footer-title">Follow us</p><div className="socials"><a href="#" aria-label="Instagram"><InstagramIcon /></a><Link href="/contact" aria-label="Email"><MailIcon /></Link></div></div>
    <p className="copyright">© {new Date().getFullYear()} Nina La Mode. All rights reserved.</p>
  </footer>;
}
