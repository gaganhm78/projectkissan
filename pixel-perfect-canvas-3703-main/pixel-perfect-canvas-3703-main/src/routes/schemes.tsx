import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Info } from "lucide-react";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Karnataka Farmer Schemes — KisanConnect" },
      { name: "description", content: "Simple guide to government schemes for Karnataka farmers with official source links." },
      { property: "og:title", content: "Government Schemes for Karnataka Farmers" },
      { property: "og:description", content: "Easy-to-read cards on PM-KISAN, crop insurance, soil health and more." },
    ],
  }),
  component: SchemesPage,
});

const SCHEMES = [
  { name: "PM-KISAN", who: "Central Government", text: "Income support of ₹6,000 per year in three instalments to eligible farmer families, paid directly to bank accounts.", url: "https://pmkisan.gov.in/" },
  { name: "Pradhan Mantri Fasal Bima Yojana", who: "Central Government", text: "Low-premium crop insurance that protects farmers against crop loss from natural calamities, pests and diseases.", url: "https://pmfby.gov.in/" },
  { name: "Soil Health Card", who: "Central Government", text: "Free soil testing with a card that recommends the right nutrients and fertilisers for your field.", url: "https://soilhealth.dac.gov.in/" },
  { name: "Kisan Credit Card", who: "Central Government / Banks", text: "Short-term crop loans at concessional interest through banks for seeds, fertiliser and farm needs.", url: "https://www.myscheme.gov.in/schemes/kcc" },
  { name: "e-NAM", who: "Central Government", text: "Online national agriculture market to compare prices and sell produce across mandis.", url: "https://enam.gov.in/" },
  { name: "Karnataka Raitha Samparka Kendras", who: "Govt of Karnataka", text: "Local farmer contact centres for seeds, inputs, advice and scheme applications. Visit the Agriculture Department site for current Karnataka schemes.", url: "https://raitamitra.karnataka.gov.in/" },
];

function SchemesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold md:text-5xl">Government schemes for farmers</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Simple summaries of schemes that can help Karnataka farmers.</p>
      <div className="mt-6 flex gap-3 rounded-2xl border border-warning/40 bg-gold/15 p-4 text-sm">
        <Info className="h-5 w-5 shrink-0 text-warning" />
        <p><b>Sample information.</b> Summaries are simplified and may be outdated. Amounts and eligibility change — always check the official website linked on each card or your nearest Raitha Samparka Kendra before applying.</p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SCHEMES.map((s) => (
          <article key={s.name} className="card-soft hover-lift flex flex-col p-6">
            <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">{s.who}</span>
            <h2 className="mt-3 text-xl font-bold">{s.name}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.text}</p>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">Official website <ExternalLink className="h-3.5 w-3.5" /></a>
          </article>
        ))}
      </div>
    </div>
  );
}
