import { useSyncExternalStore } from "react";
import { SEED_LISTINGS, type CartItem, type DeliveryId, type Listing, type Order } from "./data";

interface Farmer { name: string; phone: string; district: string }
interface Buyer { name: string; phone: string }
interface State { listings: Listing[]; cart: CartItem[]; orders: Order[]; farmer: Farmer | null; buyer: Buyer | null; delivery: DeliveryId }

const KEY = "kisanconnect-demo-v1";
const initial: State = { listings: SEED_LISTINGS, cart: [], orders: [], farmer: null, buyer: null, delivery: "shared" };
let state: State = initial;
let loaded = false;
const subs = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try { state = { ...initial, ...JSON.parse(e.newValue) }; subs.forEach((s) => s()); } catch { /* ignore */ }
  });
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch { /* ignore */ }
}

export function setState(fn: (s: State) => State) {
  load();
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota (large photos) */ }
  subs.forEach((s) => s());
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => { load(); return sel(state); },
    () => sel(initial),
  );
}

export const uid = () => Math.random().toString(36).slice(2, 9);
export type { Farmer, Buyer };
