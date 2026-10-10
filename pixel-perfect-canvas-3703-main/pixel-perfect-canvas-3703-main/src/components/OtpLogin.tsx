import { useState, type ReactNode } from "react";
import { toast } from "sonner";

/** Simulated phone + OTP login. No SMS is sent; the code is shown on screen. */
export function OtpLogin({ title, extraFields, onVerified, validate }: {
  title: string;
  extraFields?: ReactNode;
  validate?: () => string | null;
  onVerified: (phone: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState<{ code: string; expires: number } | null>(null);
  const [otp, setOtp] = useState("");

  function send(e?: React.SyntheticEvent) {
    e?.preventDefault();
    const err = validate?.();
    if (err) return void toast.error(err);
    if (!/^[6-9]\d{9}$/.test(phone)) return void toast.error("Enter a valid 10-digit mobile number");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSent({ code, expires: Date.now() + 120000 });
    setOtp("");
    toast.info(`Demo SMS to +91 ${phone}: your KisanConnect OTP is ${code}`, { duration: 10000 });
  }
  function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!sent) return;
    if (Date.now() > sent.expires) return void toast.error("OTP expired. Please resend.");
    if (otp !== sent.code) return void toast.error("Incorrect OTP. Please try again.");
    onVerified(phone);
  }

  return (
    <div className="card-soft p-8">
      <h2 className="text-2xl font-bold">{title}</h2>
      {!sent ? (
        <form onSubmit={send} className="mt-5 space-y-4">
          {extraFields}
          <label className="block text-sm font-semibold">Mobile number
            <div className="mt-1 flex gap-2"><span className="field w-16 text-center">+91</span>
              <input className="field" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="98XXXXXXXX" /></div>
          </label>
          <button className="btn btn-primary w-full">Send OTP</button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-5 space-y-4">
          <p className="text-sm">Enter the 6-digit OTP sent to <b>+91 {phone}</b>.</p>
          <div className="rounded-xl border border-dashed border-warning bg-gold/15 p-3 text-sm">
            <span className="font-semibold">Demo SMS (simulated):</span> your OTP is <b className="font-display text-lg tracking-widest">{sent.code}</b>
          </div>
          <input className="field text-center font-display text-2xl tracking-[0.5em]" inputMode="numeric" maxLength={6} autoFocus value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="••••••" aria-label="OTP" />
          <button className="btn btn-primary w-full" disabled={otp.length !== 6}>Verify OTP</button>
          <div className="flex justify-between text-sm">
            <button type="button" className="font-semibold text-primary" onClick={send}>Resend OTP</button>
            <button type="button" className="text-muted-foreground" onClick={() => setSent(null)}>Change number</button>
          </div>
        </form>
      )}
      <p className="mt-4 text-xs text-muted-foreground">Prototype: OTP is simulated on screen, no real SMS is sent.</p>
    </div>
  );
}
