import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeIndianRupee, Camera, Truck } from "lucide-react";
import hero from "@/assets/hero.jpg";
import tomato from "@/assets/tomato.jpg";
import onion from "@/assets/onion.jpg";
import greens from "@/assets/greens.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KisanConnect — Fresh From Farms. Fair For Everyone." },
      { name: "description", content: "Buy fresh vegetables directly from Karnataka farmers at fair, transparent prices with shared transport." },
      { property: "og:title", content: "KisanConnect — Fresh From Farms. Fair For Everyone." },
      { property: "og:description", content: "Direct farmer-to-buyer vegetable marketplace for Karnataka." },
    ],
  }),
  component: Home,
});

const BENEFITS = [
  { icon: BadgeIndianRupee, title: "Fair & transparent prices", text: "Farmers price within ±10% of the market rate — no hidden middlemen margins." },
  { icon: Camera, title: "Fresh farmer-uploaded photos", text: "See the actual produce, photographed by the farmer who grew it." },
  { icon: Truck, title: "Affordable shared transport", text: "Pool orders on shared trucks to cut delivery costs for everyone." },
];

const STATS = [
  { value: "5 kg", label: "Minimum order" },
  { value: "±10%", label: "Price band around market rate" },
  { value: "₹0", label: "Platform fee for farmers" },
];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Karnataka farmer holding a basket of fresh vegetables at sunset" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-36">
          <div className="max-w-2xl animate-rise text-forest-foreground">
            <span className="inline-block rounded-full bg-gold px-4 py-1 text-xs font-bold uppercase tracking-wider text-gold-foreground">Made for Karnataka</span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] md:text-7xl">Fresh From Farms.<br /><span className="text-gold">Fair For Everyone.</span></h1>
            <p className="mt-6 max-w-xl text-lg opacity-90">KisanConnect lets farmers sell vegetables directly to homes, restaurants and retailers — so farmers earn more and buyers pay less.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/buy" className="btn btn-gold">Buy Vegetables <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/sell" className="btn btn-outline">Sell Your Produce</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-5xl px-4">
        <div className="card-soft grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 text-center">
              <div className="font-display text-4xl font-bold text-primary">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center text-4xl font-bold">Why KisanConnect?</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card-soft hover-lift p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary"><b.icon className="h-6 w-6" /></span>
              <h3 className="mt-5 text-xl font-bold">{b.title}</h3>
              <p className="mt-2 text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <img src={tomato} alt="Tomatoes" loading="lazy" width={944} height={704} className="col-span-2 h-56 w-full rounded-3xl object-cover" />
            <img src={onion} alt="Onions and potatoes" loading="lazy" width={944} height={704} className="h-40 w-full rounded-3xl object-cover" />
            <img src={greens} alt="Beans, okra and carrots" loading="lazy" width={944} height={704} className="h-40 w-full rounded-3xl object-cover" />
          </div>
          <div>
            <h2 className="text-4xl font-bold">How it works</h2>
            <ol className="mt-6 space-y-5">
              {["Farmer lists produce with photos and a fair price.", "Buyer picks district, vegetables and quantity (5 kg+).", "Choose shared truck, small vehicle or door delivery.", "Farmer packs and tracks the order to delivery."].map((t, i) => (
                <li key={t} className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span><span className="pt-1">{t}</span></li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/schemes" className="btn btn-outline">Govt schemes for farmers</Link>
              <Link to="/delivery" className="btn btn-primary">Delivery options</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
