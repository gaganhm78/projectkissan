import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { ORDER_STATUSES, coordsOf } from "@/lib/data";
import { useStore } from "@/lib/store";

const TrackingMap = lazy(() => import("@/components/TrackingMap"));

export const Route = createFileRoute("/track/$orderId")({
  head: ({ params }) => ({
    meta: [
      { title: `Track order ${params.orderId} — KisanConnect` },
      { name: "description", content: "Live map tracking of your farm-fresh vegetable delivery." },
      { property: "og:title", content: "Track your order — KisanConnect" },
      { property: "og:description", content: "Follow your vegetables from the farm to your door on the map." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { orderId } = Route.useParams();
  const orders = useStore((s) => s.orders);
  const order = orders.find((o) => o.id === orderId);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(t); }, []);

  if (!order) return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Order not found</h1>
      <p className="mt-2 text-muted-foreground">Orders are saved in this browser only.</p>
      <Link to="/buy" className="btn btn-primary mt-6">Go shopping</Link>
    </div>
  );

  const idx = ORDER_STATUSES.indexOf(order.status);
  // Simulated movement: while "On the way", the truck loops along the route.
  const progress = order.status === "Delivered" ? 1 : order.status === "On the way" ? 0.15 + ((tick % 60) / 60) * 0.75 : 0;
  const from = order.from ?? coordsOf(order.district);
  const to = order.to ?? coordsOf("Bengaluru Rural");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Track order</h1>
      <p className="text-muted-foreground">{order.id} · {order.delivery} · {order.payment ?? "Demo"}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <ClientOnly fallback={<div className="h-[420px] animate-pulse rounded-2xl bg-muted" />}>
            <Suspense fallback={<div className="h-[420px] animate-pulse rounded-2xl bg-muted" />}>
              <TrackingMap from={from} to={to} progress={progress} />
            </Suspense>
          </ClientOnly>
          <p className="mt-2 text-xs text-muted-foreground">Simulated vehicle position for the prototype — not live GPS.</p>
        </div>
        <aside className="card-soft h-fit p-5">
          <h2 className="text-xl font-bold">Status</h2>
          <ol className="mt-4 space-y-4">
            {ORDER_STATUSES.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                {i <= idx ? <CheckCircle2 className="h-6 w-6 text-success" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                <span className={i <= idx ? "font-bold" : "text-muted-foreground"}>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 border-t pt-4 text-sm">
            <p className="font-semibold">Items</p>
            <p className="text-muted-foreground">{order.items.map((i) => `${i.veg} ${i.kg} kg`).join(", ")}</p>
            {order.address && <><p className="mt-3 font-semibold">Deliver to</p><p className="text-muted-foreground">{order.address}</p></>}
            <p className="mt-3 text-lg font-bold">Total ₹{order.total.toLocaleString("en-IN")}</p>
          </div>
          <p className="mt-4 rounded-xl bg-secondary p-3 text-xs">The farmer updates status from the Farmer Portal. This page updates automatically.</p>
        </aside>
      </div>
    </div>
  );
}
