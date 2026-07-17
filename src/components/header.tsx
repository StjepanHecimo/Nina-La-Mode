"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BagIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";

const links = [
  ["/", "Home"], ["/shop", "Shop"], ["/about", "O nama"], ["/contact", "Kontakt"],
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="logo" href="/" aria-label="Nina La Mode početna">NINA <span>LA MODE</span></Link>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Otvori navigaciju"><MenuIcon /></button>
      <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Glavna navigacija">
        {links.map(([href, label]) => <Link key={href} href={href} className={pathname === href ? "active" : ""} onClick={() => setOpen(false)}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <button aria-label="Pretraži"><SearchIcon /></button>
        <button aria-label="Korisnički račun"><UserIcon /></button>
        <button className="bag-button" aria-label="Košarica"><BagIcon /><span>0</span></button>
      </div>
    </header>
  );
}
