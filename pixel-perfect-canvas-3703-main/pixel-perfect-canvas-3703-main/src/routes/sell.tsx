import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Camera, CheckCircle2, ImagePlus, MapPin, LogOut, Package } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { OtpLogin } from "@/components/OtpLogin";
import { GeoCamera } from "@/components/GeoCamera";
import { Link } from "@tanstack/react-router";
import { type GeoTag, DISTRICTS, MARKET_PRICES, ORDER_STATUSES, PRICE_BAND, VEG_IMAGES, type OrderStatus } from "@/lib/data";
import { setState, uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Farmer Portal — Sell Your Produce | KisanConnect" },
      { name: "description", content: "Register as a farmer, list vegetables at fair prices within ±10% of market rate, and manage orders." },
      { property: "og:title", content: "Farmer Portal — KisanConnect" },
      { property: "og:description", content: "List vegetables, set fair prices and track orders from New to Delivered." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const farmer = useStore((s) => s.farmer);
  return farmer ? <Dashboard /> : <AuthCard />;
}

function AuthCard() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [f, setF] = useState({ name: "", district: DISTRICTS[0] as string });
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-4 grid grid-cols-2 rounded-full bg-muted p-1">
        {(["register", "login"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded-full py-2 text-sm font-bold ${mode === m ? "bg-card shadow" : "text-muted-foreground"}`}>{m === "register" ? "Register" : "Login"}</button>
        ))}
      </div>
      <OtpLogin key={mode} title={mode === "register" ? "Farmer registration" : "Farmer login"}
        validate={() => (f.name.trim().length < 2 ? "Enter your name" : null)}
        extraFields={<>
          <label className="block text-sm font-semibold">Full name<input className="field mt-1" maxLength={60} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Ramesh Gowda" /></label>
          <label className="block text-sm font-semibold">District<select className="field mt-1" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></label>
        </>}
        onVerified={(phone) => {
          setState((s) => ({ ...s, farmer: { name: f.name.trim(), district: f.district, phone } }));
          toast.success(mode === "register" ? `Welcome, ${f.name.trim()}! Mobile verified (demo).` : `Welcome back, ${f.name.trim()}!`);
        }} />
      <p className="mt-4 text-center text-xs text-muted-foreground">We never ask for Aadhaar, UPI PINs or bank details.</p>
    </div>
  );
}

function Dashboard() {
  const farmer = useStore((s) => s.farmer)!;
  const listings = useStore((s) => s.listings);
  const orders = useStore((s) => s.orders);
  const mine = listings.filter((l) => l.mine);
  const [veg, setVeg] = useState("Tomato");
  const [qty, setQty] = useState("");
  const [district, setDistrict] = useState(farmer.district);
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState<string>();
  const [geo, setGeo] = useState<GeoTag>();
  const [camOpen, setCamOpen] = useState(false);
  const closeCam = useCallback(() => setCamOpen(false), []);

  const market = MARKET_PRICES[veg] ?? 0;
  const min = Math.ceil(market * (1 - PRICE_BAND));
  const max = Math.floor(market * (1 + PRICE_BAND));
  const p = Number(price);
  const outOfBand = price !== "" && (p < min || p > max);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Please choose an image file");
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); const s = 480 / Math.max(img.width, img.height);
      c.width = img.width * s; c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      setPhoto(c.toDataURL("image/jpeg", 0.7)); setGeo(undefined);
    };
    img.src = URL.createObjectURL(file);
  }

  function publish(e: React.FormEvent) {
    e.preventDefault();
    const q = Number(qty);
    if (!q || q < 5) return void toast.error("Quantity must be at least 5 kg");
    if (!price || outOfBand) return void toast.error(`Price must be between ₹${min} and ₹${max} per kg`);
    setState((s) => ({ ...s, listings: [{ id: uid(), veg, farmer: farmer.name, district, quantity: q, price: p, photo, geo, mine: true, active: true }, ...s.listings] }));
    setQty(""); setPrice(""); setPhoto(undefined); setGeo(undefined);
    toast.success(`${veg} listing published! Buyers can see it now.`);
  }

  const setStatus = (id: string, status: OrderStatus) => { setState((s) => ({ ...s, orders: s.orders.map((o) => o.id === id ? { ...o, status } : o) })); toast.success(`Order ${id} marked ${status}`); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-4xl font-bold">Namaskara, {farmer.name}</h1><p className="text-muted-foreground">{farmer.district} · +91 {farmer.phone}</p></div>
        <button className="btn btn-outline" onClick={() => { setState((s) => ({ ...s, farmer: null })); toast("Logged out"); }}><LogOut className="h-4 w-4" /> Logout</button>
      </div>

      {camOpen && <GeoCamera onClose={closeCam} onCapture={(ph, g) => { setPhoto(ph); setGeo(g); setCamOpen(false); toast.success(g ? "Geotagged photo captured" : "Photo captured (no GPS)"); }} />}
      <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
        <form onSubmit={publish} className="card-soft h-fit space-y-4 p-6">
          <h2 className="text-2xl font-bold">Add a listing</h2>
          <label className="block text-sm font-semibold">Vegetable<select className="field mt-1" value={veg} onChange={(e) => setVeg(e.target.value)}>{Object.keys(MARKET_PRICES).map((v) => <option key={v}>{v}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold">Quantity (kg)<input type="number" min={5} className="field mt-1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="100" /></label>
            <label className="block text-sm font-semibold">District<select className="field mt-1" value={district} onChange={(e) => setDistrict(e.target.value)}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></label>
          </div>
          <div className="rounded-xl bg-secondary p-4 text-sm">
            <div className="flex justify-between"><span>Sample market price</span><b>₹{market}/kg</b></div>
            <div className="flex justify-between text-muted-foreground"><span>Allowed range (±10%)</span><span>₹{min} – ₹{max}</span></div>
          </div>
          <label className="block text-sm font-semibold">Your selling price (₹/kg)
            <input type="number" className={`field mt-1 ${outOfBand ? "border-destructive" : ""}`} value={price} onChange={(e) => setPrice(e.target.value)} placeholder={String(market)} />
          </label>
          {outOfBand && <p className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm font-semibold text-destructive"><AlertTriangle className="h-4 w-4" /> Price is outside the allowed range of ₹{min}–₹{max}.</p>}
          {price !== "" && !outOfBand && <p className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" /> Fair price — within allowed range.</p>}
          <div className="space-y-2">
            <span className="text-sm font-semibold">Produce photo</span>
            {photo && <div className="relative"><img src={photo} alt="Preview" className="h-44 w-full rounded-xl object-cover" />{geo && <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-card px-2 py-1 text-xs font-bold text-primary"><MapPin className="h-3 w-3" /> Geotagged</span>}</div>}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setCamOpen(true)} className="btn btn-primary px-3"><Camera className="h-4 w-4" /> {photo ? "Retake" : "Open camera"}</button>
              <label className="btn btn-outline cursor-pointer px-3"><ImagePlus className="h-4 w-4" /> Gallery<input type="file" accept="image/*" className="hidden" onChange={onPhoto} /></label>
            </div>
            <p className="text-xs text-muted-foreground">Camera photos are stamped with GPS location and time so buyers can trust they're fresh from your farm.</p>
          </div>
          <button className="btn btn-gold w-full">Publish listing</button>
        </form>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold">My listings</h2>
            {mine.length === 0 ? <p className="card-soft mt-3 p-6 text-muted-foreground">No listings yet. Add your first one.</p> : (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {mine.map((l) => (
                  <div key={l.id} className="card-soft flex gap-3 p-3">
                    <img src={l.photo || VEG_IMAGES[l.veg]} alt={l.veg} className="h-20 w-20 rounded-xl object-cover" />
                    <div className="flex-1 text-sm">
                      <div className="flex justify-between font-bold"><span>{l.veg}</span><span>₹{l.price}/kg</span></div>
                      <div className="text-muted-foreground">{l.quantity} kg · {l.district}</div>
                      <div className="mt-2 flex gap-2">
                        <button className="rounded-full border px-3 py-1 text-xs font-bold" onClick={() => setState((s) => ({ ...s, listings: s.listings.map((x) => x.id === l.id ? { ...x, active: !x.active } : x) }))}>{l.active ? "Pause" : "Resume"}</button>
                        <button className="rounded-full border px-3 py-1 text-xs font-bold text-destructive" onClick={() => { setState((s) => ({ ...s, listings: s.listings.filter((x) => x.id !== l.id) })); toast("Listing removed"); }}>Delete</button>
                      </div>
                      {!l.active && <span className="mt-1 inline-block text-xs text-warning">Paused — hidden from buyers</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold">Orders</h2>
            {orders.length === 0 ? <p className="card-soft mt-3 p-6 text-muted-foreground">No orders yet. Place a demo order from the Buy page to see it here.</p> : (
              <div className="mt-3 space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="card-soft p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold"><Package className="h-4 w-4 text-primary" /> {o.id}<Link to="/track/$orderId" params={{ orderId: o.id }} className="text-xs font-semibold text-primary underline">Track</Link></div>
                      <span className="text-sm text-muted-foreground">{o.delivery} · ₹{o.total.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="mt-1 text-sm">{o.items.map((i) => `${i.veg} ${i.kg}kg`).join(", ")}</p>
                    <div className="mt-3 grid grid-cols-4 gap-1">
                      {ORDER_STATUSES.map((st, i) => {
                        const done = ORDER_STATUSES.indexOf(o.status) >= i;
                        return <button key={st} onClick={() => setStatus(o.id, st)} className={`rounded-lg px-1 py-2 text-xs font-bold ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{st}</button>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
