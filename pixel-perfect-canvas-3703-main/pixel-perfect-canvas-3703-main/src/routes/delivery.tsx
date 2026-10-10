import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, Truck, Users } from "lucide-react";
import { useState } from "react";
import { DELIVERY_OPTIONS, deliveryCharge } from "@/lib/data";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Delivery Options & Prices — KisanConnect" },
      { name: "description", content: "Compare shared truck, small goods vehicle and door delivery with sample prices." },
      { property: "og:title", content: "Delivery Options — KisanConnect" },
      { property: "og:description", content: "Shared truck, small goods vehicle or door delivery — see sample charges." },
    ],
  }),
  component: DeliveryPage,
});

const ICONS = { shared: Users, sgv: Truck, door: Bike };

function DeliveryPage() {
  const [kg, setKg] = useState(25);
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold md:text-5xl">Delivery options</h1>
      <p className="mt-2 text-muted-foreground">Sample prices for this prototype: base charge + per-kg rate.</p>
      <div className="card-soft mt-8 p-5">
        <label className="text-sm font-semibold">Order weight: <b className="text-primary">{kg} kg</b></label>
        <input type="range" min={5} max={500} step={5} value={kg} onChange={(e) => setKg(Number(e.target.value))} className="mt-2 w-full accent-[var(--primary)]" />
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {DELIVERY_OPTIONS.map((d) => {
          const Icon = ICONS[d.id];
          return (
            <div key={d.id} className="card-soft hover-lift p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-gold-foreground"><Icon className="h-6 w-6" /></span>
              <h2 className="mt-4 text-2xl font-bold">{d.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
              <p className="mt-4 text-sm">₹{d.base} base + ₹{d.perKg}/kg</p>
              <p className="mt-2 font-display text-3xl font-bold text-primary">₹{deliveryCharge(d.id, kg)}</p>
              <p className="text-xs text-muted-foreground">for {kg} kg (sample)</p>
            </div>
          );
        })}
      </div>
      <div className="mt-10 text-center"><Link to="/buy" className="btn btn-primary">Start shopping</Link></div>
    </div>
  );
}
