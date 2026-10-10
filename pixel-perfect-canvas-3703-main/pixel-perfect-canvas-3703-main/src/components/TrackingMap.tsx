import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

/** Browser-only Leaflet map. Load via React.lazy behind <ClientOnly>. */
export default function TrackingMap({ from, to, progress }: { from: [number, number]; to: [number, number]; progress: number }) {
  const el = useRef<HTMLDivElement>(null);
  const truckRef = useRef<{ setLatLng: (p: [number, number]) => void } | null>(null);
  const pos = (t: number): [number, number] => [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);
      const pin = (emoji: string) => L.divIcon({ html: `<div style="font-size:28px;line-height:1">${emoji}</div>`, className: "", iconSize: [30, 30], iconAnchor: [15, 28] });
      L.marker(from, { icon: pin("🌾") }).addTo(map).bindPopup("Farm pickup");
      L.marker(to, { icon: pin("🏠") }).addTo(map).bindPopup("Delivery address");
      L.polyline([from, to], { color: "#2f6b45", weight: 4, dashArray: "8 8" }).addTo(map);
      truckRef.current = L.marker(pos(progress), { icon: pin("🚚") }).addTo(map);
      map.fitBounds(L.latLngBounds([from, to]).pad(0.3), { maxZoom: 11 });
    });
    return () => { cancelled = true; map?.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[1], to[0], to[1]]);

  useEffect(() => { truckRef.current?.setLatLng(pos(progress)); });

  return <div ref={el} className="h-[420px] w-full overflow-hidden rounded-2xl border" />;
}
