'use client';

import { Target, Eye, HeartHandshake, Factory, Train, Plane, Route, MapPin, Truck, Quote, Linkedin, MessageCircle } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="flex flex-col">
      {/* A1: Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 px-4">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto max-w-5xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">Est. 2010 · Gujarat, India</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Built on trust.<br />Driven by quality.
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            From a distribution background to a full-scale FMCG manufacturing company — the Purva Bites story is one of conviction and craft
          </p>
        </div>
      </section>

      {/* A2: Who we are */}
      <section className="bg-muted/40 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="hidden md:block w-1 h-12 bg-primary rounded-full flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-3">Purva Bites is a Gujarat-based FMCG contract manufacturer</h2>
              <p className="text-muted-foreground leading-relaxed">
                We manufacture khakhra, bhakhri, makhana, extruder snacks and digestive products entirely in-house — for brands, distributors, private label partners and institutional buyers across India. Every product that leaves our factory carries the credibility of 15+ years of manufacturing experience, 5 dedicated production lines and a team that takes food quality personally.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {[
                { value: '15+', label: 'Years in business' },
                { value: '100%', label: 'Own manufacturing' },
                { value: '12+', label: 'States served' },
                { value: '5', label: 'Production lines' },
              ].map((stat) => (
                <div key={stat.label} className="bg-background border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* A3: Company Story / Timeline */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Our Journey</p>
          <h2 className="text-2xl font-bold mb-2">How we got here</h2>
          <p className="text-sm text-muted-foreground mb-10">A business built from the ground up — from distribution to manufacturing</p>
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left: narrative */}
            <div className="flex-1 md:pr-10 md:border-r">
              <p className="text-muted-foreground leading-relaxed mb-5">
                The founders began their journey in FMCG distribution — supplying established snack brands across Gujarat and building deep knowledge of what retailers, distributors and consumers actually want from a product.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-5">
                That ground-level experience became the foundation for Purva Bites. Rather than representing other manufacturers, they built their own — starting with a single Khakhra line and methodically expanding to 5 production categories over 15 years.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Today, Purva Bites manufactures for brands, private label clients and distributors who want the reliability of a proven partner — not just a contract factory.
              </p>
              <button onClick={() => onNavigate('manufacturing')} className="text-sm font-medium text-primary hover:underline">
                Meet the founders →
              </button>
            </div>
            {/* Right: timeline */}
            <div className="flex-1 md:pl-10">
              <div className="space-y-0">
                {[
                  { year: '2010', title: 'Founded', desc: 'Company established. First Khakhra production line commissioned.' },
                  { year: '2013', title: 'FSSAI certification', desc: 'Received FSSAI licence. Expanded to Bhakhri and Makhana lines.' },
                  { year: '2017', title: 'Factory expansion', desc: 'New facility with dedicated warehouse and loading infrastructure.' },
                  { year: '2020', title: 'Private label launch', desc: 'Started contract manufacturing and private label services for B2B clients.' },
                  { year: 'Today', title: '5 lines · 80+ SKUs · 12+ states', desc: 'Serving brands, distributors and private label partners across India.', current: true },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${item.current ? 'bg-emerald-600' : 'bg-primary'}`} />
                      {i < 4 && <div className="w-px h-8 bg-border" />}
                    </div>
                    <div className="pb-6">
                      <p className={`text-xs font-semibold ${item.current ? 'text-emerald-600' : 'text-primary'}`}>{item.year}</p>
                      <p className="text-sm font-semibold mt-0.5">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A4: Director Profiles */}
      <section className="bg-muted/40 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Leadership</p>
          <h2 className="text-2xl font-bold mb-2">The people behind Purva Bites</h2>
          <p className="text-sm text-muted-foreground mb-10">Built by people who understand FMCG from the ground up</p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Director 1 */}
            <div className="bg-background border rounded-xl overflow-hidden">
              <div className="h-40 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                Director Photo
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold">[Director name]</h3>
                <p className="text-xs text-primary font-semibold mb-3">Co-founder & Managing Director</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  20+ years in FMCG distribution across Gujarat. Deep knowledge of supply chains, trade networks and what manufacturing partners actually owe their clients.
                </p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {['FMCG distribution', 'Client relations', 'Strategy'].map((tag) => (
                    <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="text-xs border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"><Linkedin className="h-3 w-3" /> LinkedIn</button>
                  <button className="text-xs border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"><MessageCircle className="h-3 w-3" /> WhatsApp</button>
                </div>
              </div>
            </div>
            {/* Director 2 */}
            <div className="bg-background border rounded-xl overflow-hidden">
              <div className="h-40 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                Director Photo
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold">[Director name]</h3>
                <p className="text-xs text-primary font-semibold mb-3">Co-founder & Operations Director</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Leads day-to-day manufacturing operations, quality systems and production planning. Oversees all 5 production lines, warehouse and dispatch.
                </p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {['Manufacturing ops', 'Quality systems', 'Production'].map((tag) => (
                    <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="text-xs border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"><Linkedin className="h-3 w-3" /> LinkedIn</button>
                  <button className="text-xs border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"><MessageCircle className="h-3 w-3" /> WhatsApp</button>
                </div>
              </div>
            </div>
            {/* Quote + CTA */}
            <div className="flex flex-col gap-4 justify-center">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                <Quote className="h-5 w-5 text-primary mb-3" />
                <p className="text-sm text-primary italic leading-relaxed">
                  &quot;We started by selling other people&apos;s products. Then we decided to build something we could stand behind completely.&quot;
                </p>
                <p className="text-xs text-primary/70 mt-3 font-medium">— [Director name], Co-founder</p>
              </div>
              <div className="bg-background border rounded-xl p-5">
                <h4 className="text-sm font-semibold mb-2">Direct access to leadership</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Our directors are directly involved in client conversations — especially for private label and large-volume partnerships.
                </p>
                <button onClick={() => onNavigate('contact')} className="w-full text-xs font-medium bg-primary text-primary-foreground rounded-md py-2 hover:bg-primary/90 transition-colors">
                  Speak to us directly →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A5: Mission, Vision, Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">What we stand for</p>
          <h2 className="text-2xl font-bold mb-10">Mission, vision & values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, color: 'text-primary', bg: 'bg-primary/10', label: 'Mission', title: 'Make Indian snacks at the quality global brands demand', desc: 'To manufacture FMCG products that meet the highest standards of consistency, hygiene and taste — enabling brands of all sizes to bring quality to their customers.' },
              { icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Vision', title: "Become India's most trusted FMCG contract manufacturer", desc: 'To be the manufacturing partner of choice for emerging and established FMCG brands — known for reliability, transparency and manufacturing excellence.' },
              { icon: HeartHandshake, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Values', title: 'Quality first · Transparency always · Partnership mindset', desc: "We don't just fulfill orders — we build long-term manufacturing relationships. Honest about capacity, proactive about issues, consistent in delivery." },
            ].map((item) => (
              <div key={item.label} className="border rounded-xl p-5">
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center mb-4`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: item.color.includes('primary') ? undefined : item.color }}>{item.label}</p>
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A6: Factory Location */}
      <section className="bg-muted/40 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Location</p>
          <h2 className="text-2xl font-bold mb-10">Where we operate</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="bg-background border rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <Factory className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold mb-1">Factory address</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">[Factory address line 1]<br />[City, District] — [PIN code]<br />Gujarat, India</p>
                  </div>
                </div>
              </div>
              <div className="bg-background border rounded-lg p-5">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Route className="h-4 w-4 text-primary" /> Logistics & accessibility</p>
                <div className="space-y-3">
                  {[
                    { icon: Train, label: 'Nearest railway station', value: '[Station] — X km' },
                    { icon: Plane, label: 'Nearest airport', value: '[Airport] — X km' },
                    { icon: Route, label: 'Nearest highway', value: 'NH-[X] — X km' },
                    { icon: Factory, label: 'Nearest major city', value: '[City] — X km' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center text-xs border-b pb-2 last:border-0">
                      <span className="text-muted-foreground flex items-center gap-2"><item.icon className="h-3.5 w-3.5" /> {item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-background border rounded-lg p-5">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-600" /> Dispatch reach</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  We dispatch to all major markets across India via road and rail freight. Consignments dispatched within agreed lead times.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['Pan-India dispatch', 'Road + rail', 'Batch-tracked'].map((tag) => (
                    <span key={tag} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-[1.4]">
              <div className="bg-muted border rounded-lg h-full min-h-[300px] flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
                <MapPin className="h-8 w-8" />
                <p>Google Maps embed</p>
                <p className="text-xs">Factory pin marked with brand marker</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A8: CTA Strip */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-10">Ready to work with us?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Factory, title: 'See our manufacturing', desc: 'Tour our 5 production lines, certifications and capability', cta: 'View manufacturing →', page: 'manufacturing' },
              { icon: Target, title: 'Get our catalogue', desc: '80+ SKUs, capacity details and packaging formats in one PDF', cta: 'Download free →', page: 'catalogue' },
              { icon: MessageCircle, title: 'Partner with us', desc: 'Bulk order, private label or distribution enquiry — start here', cta: 'Send enquiry →', page: 'contact' },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <item.icon className="h-6 w-6 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 mb-5 leading-relaxed">{item.desc}</p>
                <button onClick={() => onNavigate(item.page)} className="w-full text-xs font-medium bg-white/10 rounded-md py-2.5 hover:bg-white/20 transition-colors">
                  {item.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
