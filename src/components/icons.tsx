import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const Base = ({ children, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>
);

export const SearchIcon = (props: IconProps) => <Base {...props}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></Base>;
export const UserIcon = (props: IconProps) => <Base {...props}><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.6-4 2.8-6 6.5-6s5.9 2 6.5 6"/></Base>;
export const BagIcon = (props: IconProps) => <Base {...props}><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></Base>;
export const ArrowIcon = (props: IconProps) => <Base {...props}><path d="M5 12h14M14 7l5 5-5 5"/></Base>;
export const InstagramIcon = (props: IconProps) => <Base {...props}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></Base>;
export const MailIcon = (props: IconProps) => <Base {...props}><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></Base>;
export const MenuIcon = (props: IconProps) => <Base {...props}><path d="M4 8h16M4 16h16"/></Base>;
