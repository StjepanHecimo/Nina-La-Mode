"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BagIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";

const links = [
  ["/", "Home"], ["/shop", "Shop"], ["/about", "About"], ["/contact", "Contact"],
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="logo" href="/" aria-label="Nina La Mode home">NINA <span>LA MODE</span></Link>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Open navigation"><MenuIcon /></button>
      <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
        {links.map(([href, label]) => <Link key={href} href={href} className={pathname === href ? "active" : ""} onClick={() => setOpen(false)}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <button aria-label="Search"><SearchIcon /></button>
        <button aria-label="Account"><UserIcon /></button>
        <button className="bag-button" aria-label="Shopping bag"><BagIcon /><span>0</span></button>
      </div>
    </header>
  );
}
