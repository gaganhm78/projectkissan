import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Minus, Plus, Search, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DISTRICTS, MIN_ORDER_KG, STATE, VEG_IMAGES, deliveryCharge, type DeliveryId } from "@/lib/data";
import { setState, useStore } from "@/lib/store";
import { DELIVERY_OPTIONS as DELIVERY_OPTS } from "@/lib/data";

export const Route = createFileRoute("/buy")({
  head: () => ({
    meta: [
      { title: "Buy Fresh Vegetables — KisanConnect" },
      { name: "description", content: "Browse vegetables from Karnataka farmers by district, add 5 kg+ to cart and choose delivery." },
      { property: "og:title", content: "Buy Fresh Vegetables — KisanConnect" },
      { property: "og:description", content: "Search and filter farm-fresh vegetables across 10 Karnataka districts." },
    ],
  }),
  component: BuyPage,
});

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

function BuyPage() {
  const listings = useStore((s) => s.listings);
  const cart = useStore((s) => s.cart);
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("All");
  const [qty, setQty] = useState<Record<string, number>>({});
  const delivery = useStore((s) => s.delivery);
  const setDelivery = (d: DeliveryId) => setState((s) => ({ ...s, delivery: d }));
  const navigate = useNavigate();

  const visible = useMemo(() => listings.filter((l) => l.active && l.quantity > 0
    && (district === "All" || l.district === district)
    && l.veg.toLowerCase().includes(q.trim().toLowerCase())), [listings, q, district]);

  const lines = cart.map((c) => ({ ...c, l: listings.find((l) => l.id === c.listingId)! })).filter((x) => x.l);
  const totalKg = lines.reduce((a, x) => a + x.kg, 0);
  const subtotal = lines.reduce((a, x) => a + x.kg * x.l.price, 0);
  const del = deliveryCharge(delivery, totalKg);

  function add(id: string, available: number) {
    const kg = qty[id] ?? MIN_ORDER_KG;
    if (!Number.isFinite(kg) || kg < MIN_ORDER_KG) return void toast.error(`Minimum order is ${MIN_ORDER_KG} kg`);
    const existing = cart.find((c) => c.listingId === id)?.kg ?? 0;
    if (existing + kg > available) return void toast.error(`Only ${available} kg available`);
    setState((s) => ({ ...s, cart: existing ? s.cart.map((c) => c.listingId === id ? { ...c, kg: c.kg + kg } : c) : [...s.cart, { listingId: id, kg }] }));
    toast.success(`Added ${kg} kg to cart`);
  }
  function setLineKg(id: string, kg: number, max: number) {
    if (kg < MIN_ORDER_KG) return void toast.error(`Minimum ${MIN_ORDER_KG} kg per item`);
    if (kg > max) return void toast.error(`Only ${max} kg available`);
    setState((s) => ({ ...s, cart: s.cart.map((c) => c.listingId === id ? { ...c, kg } : c) }));
  }
  function placeOrder() {
    if (!lines.length) return void toast.error("Your cart is empty");
    navigate({ to: "/checkout" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-bold md:text-5xl">Buy fresh vegetables</h1>
      <p className="mt-2 text-muted-foreground">Direct from farmers. Minimum {MIN_ORDER_KG} kg per item.</p>

      <div className="card-soft mt-8 grid gap-3 p-4 md:grid-cols-[180px_220px_1fr]">
        <label className="text-sm font-semibold">State
          <select className="field mt-1" value={STATE} disabled><option>{STATE}</option></select>
        </label>
        <label className="text-sm font-semibold">District
          <select className="field mt-1" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="All">All districts</option>
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">Search vegetable
          <div className="relative mt-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="field pl-9" placeholder="e.g. Tomato, Onion…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </label>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {visible.length === 0 ? (
            <div className="card-soft p-10 text-center text-muted-foreground">No vegetables match your filters. Try another district or search.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((l) => (
                <article key={l.id} className="card-soft hover-lift overflow-hidden">
                  <img src={l.photo || VEG_IMAGES[l.veg] || VEG_IMAGES["Tomato"]} alt={l.veg} loading="lazy" className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold">{l.veg}</h3>
                      <span className="font-display text-xl font-bold text-primary">{inr(l.price)}<span className="text-xs font-sans text-muted-foreground">/kg</span></span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {l.farmer}</div>
                      <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {l.district}{l.geo && <span className="ml-1 rounded-full bg-secondary px-2 text-xs font-bold text-primary">📍 Geotagged</span>}</div>
                      <div>Available: <b className="text-foreground">{l.quantity} kg</b></div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input type="number" min={MIN_ORDER_KG} max={l.quantity} className="field w-20" aria-label="Quantity in kg"
                        value={qty[l.id] ?? MIN_ORDER_KG} onChange={(e) => setQty({ ...qty, [l.id]: Number(e.target.value) })} />
                      <button className="btn btn-primary flex-1 px-3" onClick={() => add(l.id, l.quantity)}>Add to cart</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside id="cart" className="card-soft h-fit p-5 lg:sticky lg:top-20">
          <h2 className="text-2xl font-bold">Your cart</h2>
          {lines.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Cart is empty. Add vegetables to begin.</p> : (
            <ul className="mt-4 divide-y">
              {lines.map((x) => (
                <li key={x.listingId} className="py-3">
                  <div className="flex justify-between font-semibold"><span>{x.l.veg}</span><span>{inr(x.kg * x.l.price)}</span></div>
                  <div className="text-xs text-muted-foreground">{x.l.farmer} · {inr(x.l.price)}/kg</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="grid h-7 w-7 place-items-center rounded-full border" onClick={() => setLineKg(x.listingId, x.kg - 1, x.l.quantity)} aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                    <span className="w-14 text-center text-sm font-bold">{x.kg} kg</span>
                    <button className="grid h-7 w-7 place-items-center rounded-full border" onClick={() => setLineKg(x.listingId, x.kg + 1, x.l.quantity)} aria-label="Increase"><Plus className="h-3 w-3" /></button>
                    <button className="ml-auto text-destructive" aria-label="Remove" onClick={() => setState((s) => ({ ...s, cart: s.cart.filter((c) => c.listingId !== x.listingId) }))}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-muted-foreground">Delivery</h3>
          <div className="mt-2 space-y-2">
            {DELIVERY_OPTS.map((d) => (
              <label key={d.id} className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 text-sm ${delivery === d.id ? "border-primary bg-secondary" : ""}`}>
                <span className="flex items-center gap-2"><input type="radio" name="delivery" checked={delivery === d.id} onChange={() => setDelivery(d.id)} />{d.name}</span>
                <span className="font-semibold">{inr(deliveryCharge(d.id, totalKg))}</span>
              </label>
            ))}
          </div>
          <dl className="mt-5 space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Total weight</dt><dd>{totalKg} kg</dd></div>
            <div className="flex justify-between"><dt>Vegetables</dt><dd>{inr(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{inr(del)}</dd></div>
            <div className="flex justify-between pt-2 text-lg font-bold"><dt>Total</dt><dd className="text-primary">{inr(subtotal + del)}</dd></div>
          </dl>
          <button className="btn btn-gold mt-4 w-full" onClick={placeOrder} disabled={!lines.length}>Proceed to payment</button>
          <p className="mt-2 text-center text-xs text-muted-foreground">No real payment. <Link to="/delivery" className="underline">Delivery details</Link></p>
        </aside>
      </div>
    </div>
  );
}
