import tomato from "@/assets/tomato.jpg";
import onion from "@/assets/onion.jpg";
import greens from "@/assets/greens.jpg";

export const STATE = "Karnataka";
export const DISTRICTS = [
  "Kolar", "Chikkaballapur", "Bengaluru Rural", "Tumakuru", "Mandya",
  "Mysuru", "Hassan", "Davanagere", "Belagavi", "Dharwad",
] as const;

export const MIN_ORDER_KG = 5;
export const PRICE_BAND = 0.1;

/** Sample market prices (₹/kg) — illustrative only, not live mandi data. */
export const MARKET_PRICES: Record<string, number> = {
  Tomato: 28, Onion: 34, Potato: 30, Beans: 52, Carrot: 44,
  Cabbage: 22, Okra: 40, "Green Chilli": 60,
};

export const VEG_IMAGES: Record<string, string> = {
  Tomato: tomato, Onion: onion, Potato: onion, Beans: greens, Carrot: greens,
  Cabbage: greens, Okra: greens, "Green Chilli": greens,
};

export type OrderStatus = "New" | "Packed" | "On the way" | "Delivered";
export const ORDER_STATUSES: OrderStatus[] = ["New", "Packed", "On the way", "Delivered"];

export interface Listing {
  id: string; veg: string; farmer: string; district: string;
  quantity: number; price: number; photo?: string | undefined; geo?: GeoTag | undefined; mine?: boolean; active: boolean;
}
export interface CartItem { listingId: string; kg: number }
export interface Order {
  id: string; items: { veg: string; farmer: string; kg: number; price: number }[];
  delivery: string; total: number; status: OrderStatus; createdAt: string; district: string;
  buyerPhone?: string; address?: string; payment?: string;
  from?: [number, number]; to?: [number, number];
}
export interface GeoTag { lat: number; lng: number; at: string }

/** Approximate district HQ coordinates. */
export const DISTRICT_COORDS: Record<string, [number, number]> = {
  Kolar: [13.1367, 78.1292], Chikkaballapur: [13.4355, 77.7315], "Bengaluru Rural": [13.2846, 77.6078],
  Tumakuru: [13.3379, 77.1173], Mandya: [12.5218, 76.8951], Mysuru: [12.2958, 76.6394],
  Hassan: [13.0068, 76.0996], Davanagere: [14.4644, 75.9218], Belagavi: [15.8497, 74.4977], Dharwad: [15.4589, 75.0078],
};
export const coordsOf = (d: string): [number, number] => DISTRICT_COORDS[d] ?? [12.9716, 77.5946];

export const DELIVERY_OPTIONS = [
  { id: "shared", name: "Shared Truck", desc: "Pooled with nearby buyers. Cheapest, 1–2 days.", perKg: 1.5, base: 30 },
  { id: "sgv", name: "Small Goods Vehicle", desc: "Dedicated mini-truck for mid-size orders, same/next day.", perKg: 2.5, base: 120 },
  { id: "door", name: "Door Delivery", desc: "Two-wheeler/van to your doorstep, same day.", perKg: 4, base: 60 },
] as const;
export type DeliveryId = (typeof DELIVERY_OPTIONS)[number]["id"];

export function deliveryCharge(id: DeliveryId, kg: number) {
  const o = DELIVERY_OPTIONS.find((d) => d.id === id)!;
  return kg === 0 ? 0 : Math.round(o.base + o.perKg * kg);
}

export const SEED_LISTINGS: Listing[] = [
  { id: "l1", veg: "Tomato", farmer: "Ramesh Gowda", district: "Kolar", quantity: 400, price: 27, active: true },
  { id: "l2", veg: "Onion", farmer: "Lakshmamma", district: "Chikkaballapur", quantity: 650, price: 35, active: true },
  { id: "l3", veg: "Beans", farmer: "Manjunath K", district: "Bengaluru Rural", quantity: 120, price: 55, active: true },
  { id: "l4", veg: "Potato", farmer: "Shivanna", district: "Hassan", quantity: 900, price: 29, active: true },
  { id: "l5", veg: "Carrot", farmer: "Savitha R", district: "Mysuru", quantity: 200, price: 46, active: true },
  { id: "l6", veg: "Cabbage", farmer: "Basavaraj Patil", district: "Belagavi", quantity: 300, price: 21, active: true },
  { id: "l7", veg: "Okra", farmer: "Nagaraj M", district: "Mandya", quantity: 90, price: 41, active: true },
  { id: "l8", veg: "Green Chilli", farmer: "Fathima B", district: "Davanagere", quantity: 75, price: 62, active: true },
  { id: "l9", veg: "Tomato", farmer: "Hanumanthappa", district: "Tumakuru", quantity: 260, price: 29, active: true },
  { id: "l10", veg: "Onion", farmer: "Girish Hegde", district: "Dharwad", quantity: 500, price: 33, active: true },
];
