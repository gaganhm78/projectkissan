import { Camera, MapPin, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { GeoTag } from "@/lib/data";

/** Opens the device camera, captures a frame and stamps GPS + time onto the photo. */
export function GeoCamera({ onCapture, onClose }: { onCapture: (photo: string, geo?: GeoTag) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [geo, setGeo] = useState<GeoTag>();
  const [geoStatus, setGeoStatus] = useState("Getting location…");
  const [facing, setFacing] = useState<"environment" | "user">("environment");

  useEffect(() => {
    let s: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 } }, audio: false })
      .then((st) => { s = st; setStream(st); if (video.current) video.current.srcObject = st; })
      .catch(() => { toast.error("Camera not available. Please allow camera access."); onClose(); });
    return () => s?.getTracks().forEach((t) => t.stop());
  }, [facing, onClose]);

  useEffect(() => {
    if (!navigator.geolocation) return setGeoStatus("Location not supported");
    navigator.geolocation.getCurrentPosition(
      (p) => { setGeo({ lat: p.coords.latitude, lng: p.coords.longitude, at: new Date().toISOString() }); setGeoStatus("Location locked"); },
      () => setGeoStatus("Location permission denied — photo won't be geotagged"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  function capture() {
    const v = video.current; if (!v || !v.videoWidth) return;
    const scale = 720 / Math.max(v.videoWidth, v.videoHeight);
    const c = document.createElement("canvas");
    c.width = v.videoWidth * scale; c.height = v.videoHeight * scale;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const tag = geo ? { ...geo, at: new Date().toISOString() } : undefined;
    const lines = tag
      ? [`📍 ${tag.lat.toFixed(5)}, ${tag.lng.toFixed(5)}`, new Date(tag.at).toLocaleString("en-IN"), "KisanConnect • Geotagged"]
      : [new Date().toLocaleString("en-IN"), "KisanConnect • No GPS"];
    const h = 22 * lines.length + 16;
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, c.height - h, c.width, h);
    ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif";
    lines.forEach((l, i) => ctx.fillText(l, 12, c.height - h + 26 + i * 22));
    stream?.getTracks().forEach((t) => t.stop());
    onCapture(c.toDataURL("image/jpeg", 0.75), tag);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-forest/95 p-4">
      <div className="flex items-center justify-between text-forest-foreground">
        <span className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-gold" /> {geoStatus}{geo && ` (${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)})`}</span>
        <button onClick={onClose} aria-label="Close camera" className="grid h-10 w-10 place-items-center rounded-full bg-card text-foreground"><X className="h-5 w-5" /></button>
      </div>
      <video ref={video} autoPlay playsInline muted className="mx-auto my-4 max-h-[70vh] w-full max-w-3xl flex-1 rounded-2xl bg-foreground object-contain" />
      <div className="flex items-center justify-center gap-6">
        <button onClick={() => setFacing(facing === "environment" ? "user" : "environment")} aria-label="Switch camera" className="grid h-12 w-12 place-items-center rounded-full bg-card"><RefreshCw className="h-5 w-5" /></button>
        <button onClick={capture} aria-label="Take photo" className="grid h-20 w-20 place-items-center rounded-full border-4 border-card bg-gold text-gold-foreground"><Camera className="h-8 w-8" /></button>
        <span className="w-12" />
      </div>
    </div>
  );
}
