import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBasket, Sprout, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/buy", label: "Buy Vegetables" },
  { to: "/sell", label: "Farmer Portal" },
  { to: "/delivery", label: "Delivery" },
  { to: "/schemes", label: "Govt Schemes" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Sprout className="h-5 w-5" /></span>
      <span className="font-display text-xl font-bold">Kisan<span className="text-primary">Connect</span></span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const cart = useStore((s) => s.cart);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/buy" hash="cart" className="relative grid h-10 w-10 place-items-center rounded-full border bg-card" aria-label="Cart">
            <ShoppingBasket className="h-5 w-5" />
            {cart.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-xs font-bold text-gold-foreground">{cart.length}</span>}
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-full border bg-card lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t bg-background px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-semibold">{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-forest text-forest-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl font-bold">KisanConnect</div>
          <p className="mt-2 text-sm opacity-80">Direct farm-to-buyer vegetable marketplace for Karnataka.</p>
        </div>
        <div className="text-sm opacity-80">
          <p className="font-semibold opacity-100">Prototype notice</p>
          <p className="mt-1">This is a demo with sample data. Payments, OTP, GPS verification and a shared database are not implemented. Data is saved only in this browser.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {NAV.map((n) => <Link key={n.to} to={n.to} className="opacity-80 hover:opacity-100">{n.label}</Link>)}
        </div>
      </div>
    </footer>
  );
}
