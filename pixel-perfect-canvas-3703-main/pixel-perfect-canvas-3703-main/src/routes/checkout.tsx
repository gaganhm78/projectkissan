import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, CreditCard, Loader2, LocateFixed, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OtpLogin } from "@/components/OtpLogin";
import { DELIVERY_OPTIONS, DISTRICTS, coordsOf, deliveryCharge } from "@/lib/data";
import { setState, uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout & Payment — KisanConnect" },
      { name: "description", content: "Log in with your mobile number, add your delivery address and pay for your farm-fresh order." },
      { property: "og:title", content: "Checkout — KisanConnect" },
      { property: "og:description", content: "Secure demo checkout for direct-from-farm vegetables." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
type Method = "upi" | "card" | "cod";

function CheckoutPage() {
  const buyer = useStore((s) => s.buyer);
  const cart = useStore((s) => s.cart);
  const [name, setName] = useState("");

  if (!cart.length) return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Your cart is empty</h1>
      <Link to="/buy" className="btn btn-primary mt-6">Browse vegetables</Link>
    </div>
  );

  if (!buyer) return (
    <div className="mx-auto max-w-md px-4 py-16">
      <OtpLogin title="Buyer login" validate={() => (name.trim().length < 2 ? "Enter your name" : null)}
        extraFields={<label className="block text-sm font-semibold">Your name<input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya" maxLength={60} /></label>}
        onVerified={(phone) => { setState((s) => ({ ...s, buyer: { name: name.trim(), phone } })); toast.success("Mobile verified (demo). Continue to payment."); }} />
    </div>
  );
  return <Payment />;
}

function Payment() {
  const buyer = useStore((s) => s.buyer)!;
  const cart = useStore((s) => s.cart);
  const listings = useStore((s) => s.listings);
  const delivery = useStore((s) => s.delivery);
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState<string>(DISTRICTS[0]);
  const [loc, setLoc] = useState<[number, number]>();
  const [method, setMethod] = useState<Method>("upi");
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({ num: "", exp: "", name: "" });
  const [paying, setPaying] = useState(false);

  const lines = cart.map((c) => ({ ...c, l: listings.find((l) => l.id === c.listingId)! })).filter((x) => x.l);
  const totalKg = lines.reduce((a, x) => a + x.kg, 0);
  const subtotal = lines.reduce((a, x) => a + x.kg * x.l.price, 0);
  const del = deliveryCharge(delivery, totalKg);
  const total = subtotal + del;
  const dName = DELIVERY_OPTIONS.find((d) => d.id === delivery)!.name;

  function locate() {
    if (!navigator.geolocation) return void toast.error("Location not supported on this device");
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc([p.coords.latitude, p.coords.longitude]); toast.success("Location added for delivery tracking"); },
      () => toast.error("Location permission denied. We'll use your district instead."),
    );
  }

  function pay(e: React.FormEvent) {
    e.preventDefault();
    if (address.trim().length < 10) return void toast.error("Please enter your full delivery address");
    if (method === "upi" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi)) return void toast.error("Enter a valid UPI ID, e.g. name@okaxis");
    if (method === "card") {
      if (!/^\d{16}$/.test(card.num.replace(/\s/g, ""))) return void toast.error("Enter a 16-digit card number");
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp)) return void toast.error("Enter expiry as MM/YY");
      if (card.name.trim().length < 2) return void toast.error("Enter the name on card");
    }
    setPaying(true);
    setTimeout(() => {
      const id = "KC" + uid().toUpperCase();
      const first = lines[0]!.l;
      const from = first.geo ? [first.geo.lat, first.geo.lng] as [number, number] : coordsOf(first.district);
      const payLabel = method === "upi" ? `UPI (${upi})` : method === "card" ? `Card •••• ${card.num.slice(-4)}` : "Cash on delivery";
      setState((s) => ({
        ...s,
        listings: s.listings.map((l) => { const c = s.cart.find((x) => x.listingId === l.id); return c ? { ...l, quantity: l.quantity - c.kg } : l; }),
        orders: [{ id, items: lines.map((x) => ({ veg: x.l.veg, farmer: x.l.farmer, kg: x.kg, price: x.l.price })), delivery: dName, total, status: "New", createdAt: new Date().toISOString(), district: first.district, buyerPhone: buyer.phone, address: `${address.trim()}, ${district}`, payment: payLabel, from, to: loc ?? coordsOf(district) }, ...s.orders],
        cart: [],
      }));
      toast.success(method === "cod" ? "Order placed! Pay cash on delivery." : `Payment of ${inr(total)} successful (demo). Order placed!`);
      navigate({ to: "/track/$orderId", params: { orderId: id } });
    }, 1800);
  }

  const methods = [
    { id: "upi" as const, label: "UPI", icon: Smartphone },
    { id: "card" as const, label: "Card", icon: CreditCard },
    { id: "cod" as const, label: "Cash on delivery", icon: Banknote },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-4xl font-bold">Checkout</h1><p className="text-muted-foreground">Logged in as {buyer.name} · +91 {buyer.phone}</p></div>
        <button className="btn btn-outline" onClick={() => setState((s) => ({ ...s, buyer: null }))}><LogOut className="h-4 w-4" /> Switch account</button>
      </div>
      <form onSubmit={pay} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card-soft space-y-4 p-6">
            <h2 className="text-2xl font-bold">Delivery address</h2>
            <textarea className="field min-h-24" maxLength={300} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no, street, area, landmark, PIN code" />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold">District<select className="field mt-1" value={district} onChange={(e) => setDistrict(e.target.value)}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></label>
              <button type="button" onClick={locate} className="btn btn-outline self-end"><LocateFixed className="h-4 w-4" /> {loc ? "Location added ✓" : "Use my location"}</button>
            </div>
          </section>
          <section className="card-soft space-y-4 p-6">
            <h2 className="text-2xl font-bold">Payment method</h2>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button type="button" key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-sm font-bold ${method === m.id ? "border-primary bg-secondary" : ""}`}>
                  <m.icon className="h-5 w-5 text-primary" />{m.label}
                </button>
              ))}
            </div>
            {method === "upi" && <label className="block text-sm font-semibold">UPI ID<input className="field mt-1" value={upi} onChange={(e) => setUpi(e.target.value.trim())} placeholder="yourname@okaxis" maxLength={60} /><span className="mt-1 block text-xs font-normal text-muted-foreground">You'd approve the request in your UPI app. Never share your UPI PIN with anyone.</span></label>}
            {method === "card" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold sm:col-span-2">Card number<input className="field mt-1" inputMode="numeric" maxLength={19} value={card.num} onChange={(e) => setCard({ ...card, num: e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ") })} placeholder="4111 1111 1111 1111" /></label>
                <label className="text-sm font-semibold">Expiry<input className="field mt-1" maxLength={5} value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} placeholder="MM/YY" /></label>
                <label className="text-sm font-semibold">Name on card<input className="field mt-1" maxLength={60} value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></label>
              </div>
            )}
            {method === "cod" && <p className="rounded-xl bg-secondary p-3 text-sm">Pay {inr(total)} in cash when your vegetables arrive.</p>}
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-success" /> Demo payment — no money is charged and card details are not stored.</p>
          </section>
        </div>
        <aside className="card-soft h-fit p-5 lg:sticky lg:top-20">
          <h2 className="text-2xl font-bold">Order summary</h2>
          <ul className="mt-3 divide-y text-sm">
            {lines.map((x) => <li key={x.listingId} className="flex justify-between py-2"><span>{x.l.veg} · {x.kg} kg<br /><span className="text-xs text-muted-foreground">{x.l.farmer}, {x.l.district}</span></span><span className="font-semibold">{inr(x.kg * x.l.price)}</span></li>)}
          </ul>
          <dl className="mt-3 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between"><dt>Vegetables</dt><dd>{inr(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>{dName}</dt><dd>{inr(del)}</dd></div>
            <div className="flex justify-between pt-2 text-lg font-bold"><dt>Total</dt><dd className="text-primary">{inr(total)}</dd></div>
          </dl>
          <button className="btn btn-gold mt-4 w-full" disabled={paying}>{paying ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : method === "cod" ? "Place order" : `Pay ${inr(total)}`}</button>
          <Link to="/buy" className="mt-3 block text-center text-sm underline">Back to cart</Link>
        </aside>
      </form>
    </div>
  );
}
