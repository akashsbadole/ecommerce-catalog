'use client';

import { useState } from 'react';
import { Award, Factory, Leaf, Filter, Flame, Microscope, Package, Truck, Download, MapPin, Clock } from 'lucide-react';

interface ManufacturingPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

const productionLines = [
  { id: 'khakhra', name: 'Khakhra line', flagship: true, capacity: 'X,XXX kg', variants: '12+ flavours', packs: '30g · 80g · 200g · bulk', desc: 'Fully automated rolling and roasting machinery. Consistent thickness, texture and flavour across batches. Available in plain, masala, methi, jeera and custom flavour profiles for private label.', tags: ['Automated rolling', 'Precision roasting', 'Auto weighing', 'Custom flavour ready'] },
  { id: 'bhakhri', name: 'Bhakhri line', flagship: false, capacity: 'X,XXX kg', variants: '8+ varieties', packs: '80g · 200g · bulk', desc: 'Traditional recipes with modern automation. Consistent thickness and crunch across batches. Available in multiple grain compositions.', tags: ['Traditional recipe', 'Auto sheeting', 'Uniform baking'] },
  { id: 'makhana', name: 'Makhana line', flagship: false, capacity: 'X,XXX kg', variants: '6+ flavours', packs: '30g · 80g · 200g · bulk', desc: 'Specialised roasting and flavouring line for fox nuts. Light, crispy finish with even coating across all flavour variants.', tags: ['Low-oil roasting', 'Even coating', 'Flavour infusion'] },
  { id: 'extruder', name: 'Extruder line', flagship: false, capacity: 'X,XXX kg', variants: '10+ shapes', packs: '30g · 80g · 200g · bulk', desc: 'High-speed extrusion for puffed and shaped snacks. Custom shapes and textures achievable for private label clients.', tags: ['Custom shapes', 'High-speed', 'Texture control'] },
  { id: 'digestive', name: 'Digestive line', flagship: false, capacity: 'X,XXX kg', variants: '5+ varieties', packs: '80g · 200g · bulk', desc: 'Baked digestive biscuits and health-focused snacks. Formulations customisable for target nutrition profiles.', tags: ['Baked not fried', 'Health-focused', 'Custom nutrition'] },
];

const qualitySteps = [
  { icon: Leaf, color: 'bg-primary/10 text-primary', title: 'Raw material intake', desc: 'Supplier grading, moisture check, lab testing before acceptance' },
  { icon: Filter, color: 'bg-emerald-50 text-emerald-600', title: 'Cleaning & prep', desc: 'Sieving, washing, pre-treatment as per product spec' },
  { icon: Flame, color: 'bg-amber-50 text-amber-600', title: 'Production', desc: 'Automated processing on dedicated line — controlled temp, time, texture' },
  { icon: Microscope, color: 'bg-orange-50 text-orange-600', title: 'In-line QC checks', desc: 'Colour, texture, weight, taste checks at every 30 min intervals' },
  { icon: Package, color: 'bg-blue-50 text-blue-600', title: 'Packaging', desc: 'Auto-fill, seal, label — Purva Bites or custom private label pack' },
  { icon: Truck, color: 'bg-green-50 text-green-700', title: 'Dispatch', desc: 'Lot-tagged, batch-coded, climate-appropriate loading & dispatch' },
];

export function ManufacturingPage({ onNavigate }: ManufacturingPageProps) {
  const [activeLine, setActiveLine] = useState('khakhra');
  const activeLineData = productionLines.find((l) => l.id === activeLine) || productionLines[0];

  return (
    <div className="flex flex-col">
      {/* M1: Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-28 px-4">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs text-emerald-300 mb-6">
            <Award className="h-3.5 w-3.5" /> FSSAI certified · ISO compliant · 100% own manufacturing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            State-of-the-art FMCG<br />contract manufacturing
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            From raw material to finished, packaged goods — at scale, with precision, under one roof in Gujarat
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => onNavigate('contact')} className="bg-primary text-primary-foreground text-sm font-medium rounded-full px-6 py-2.5 hover:bg-primary/90 transition-colors">
              Request a factory visit
            </button>
            <button className="bg-white/10 text-gray-300 text-sm font-medium rounded-full px-6 py-2.5 hover:bg-white/20 transition-colors">
              Download capability deck
            </button>
          </div>
        </div>
      </section>

      {/* Intro + Metrics */}
      <section className="bg-muted/40 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs text-muted-foreground mb-4">Home › Manufacturing</p>
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-[2]">
              <h2 className="text-lg font-bold mb-2">Built to manufacture. Not to outsource.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every product that leaves our facility is made in-house — on our machinery, by our team, under our quality controls. We operate 5 dedicated production lines with a combined annual capacity exceeding 5,000 MT, serving brands, distributors and private label partners across India.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              {[
                { value: '5', label: 'Production lines' },
                { value: '5,000+', label: 'MT / year capacity' },
                { value: '80+', label: 'Active SKUs' },
                { value: '15+', label: 'Years experience' },
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

      {/* M2: Production Lines */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Production lines</p>
          <h2 className="text-2xl font-bold mb-6">Our 5 production lines</h2>
          <div className="flex gap-2 mb-8 flex-wrap">
            {productionLines.map((line) => (
              <button
                key={line.id}
                onClick={() => setActiveLine(line.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  activeLine === line.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {line.name}
              </button>
            ))}
          </div>
          <div className="border rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-[280px] h-48 md:h-auto bg-muted flex items-center justify-center text-muted-foreground text-sm flex-shrink-0">
                {activeLineData.name} machinery photo
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{activeLineData.name} production</h3>
                  {activeLineData.flagship && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">Flagship line</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-xs">
                    <p className="font-semibold text-sm mb-0.5">Capacity / day</p>
                    <p className="text-muted-foreground">{activeLineData.capacity}</p>
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-sm mb-0.5">Variants</p>
                    <p className="text-muted-foreground">{activeLineData.variants}</p>
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-sm mb-0.5">Pack sizes</p>
                    <p className="text-muted-foreground">{activeLineData.packs}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{activeLineData.desc}</p>
                <div className="flex gap-2 flex-wrap">
                  {activeLineData.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* M4: Quality Process */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Quality process</p>
          <h2 className="text-2xl font-bold mb-2">From raw material to your shelf</h2>
          <p className="text-sm text-muted-foreground mb-10">Every batch follows a documented 6-stage quality process — no shortcuts</p>
          <div className="flex flex-col md:flex-row items-start gap-2">
            {qualitySteps.map((step, i) => (
              <div key={step.title} className="flex items-start flex-1">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mb-3`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold mb-1">{step.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
                {i < qualitySteps.length - 1 && (
                  <div className="hidden md:flex items-start pt-5 px-1 text-muted-foreground">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 bg-muted/50 border rounded-lg p-4 flex flex-wrap gap-6 items-center">
            {['Batch traceability maintained', 'Staff in hygienic uniforms & gloves', 'CCTV-monitored production areas', 'Third-party lab testing on request'].map((item) => (
              <span key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* M5: Private Label */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-2">Your brand. Our factory.</h2>
          <p className="text-sm text-gray-400 mb-10">We handle the entire manufacturing and packaging process — you bring the brand identity</p>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-[1.2] space-y-4">
              {[
                { title: 'Custom packaging', desc: 'Supply your artwork / brief — we print and pack under your brand name, barcode and design' },
                { title: 'Custom formulation', desc: 'Adjust flavour, spice levels, ingredients to match your product brief and target market' },
                { title: 'Regulatory compliance handled', desc: 'FSSAI declaration, nutritional labels, batch coding — all managed at our end' },
              ].map((item) => (
                <div key={item.title} className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Package className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">{item.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-sm font-semibold mb-4">Key details at a glance</p>
                {[
                  { label: 'Minimum order qty (MOQ)', value: 'As per product — share requirement' },
                  { label: 'Lead time (first batch)', value: '15–21 working days' },
                  { label: 'Pack size flexibility', value: '10g to 1kg — all sizes' },
                  { label: 'NDA / confidentiality', value: 'Available on request' },
                  { label: 'Sample order', value: 'Available before bulk' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center text-xs py-2.5 border-b border-white/10 last:border-0">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-gray-200">{item.value}</span>
                  </div>
                ))}
                <button onClick={() => onNavigate('contact')} className="w-full mt-5 bg-primary text-primary-foreground text-sm font-medium rounded-md py-2.5 hover:bg-primary/90 transition-colors">
                  Enquire for private label →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* M6: Certifications */}
      <section className="bg-muted/40 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Certifications</p>
          <h2 className="text-2xl font-bold mb-8">Certified. Audited. Trusted.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { name: 'FSSAI licence', desc: 'Food safety & standards authority' },
              { name: 'ISO certification', desc: 'Quality management systems' },
              { name: 'BIS certification', desc: 'Bureau of Indian standards' },
              { name: 'Other certification', desc: 'To be added by client' },
            ].map((cert) => (
              <div key={cert.name} className="bg-background border rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-3 flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {cert.name.split(' ')[0]}
                </div>
                <p className="text-sm font-semibold mb-1">{cert.name}</p>
                <p className="text-xs text-muted-foreground mb-3">{cert.desc}</p>
                <button className="text-[10px] border rounded px-2 py-1 flex items-center gap-1 mx-auto hover:bg-muted">
                  <Download className="h-3 w-3" /> Download PDF
                </button>
              </div>
            ))}
          </div>
          <div className="bg-background border rounded-lg p-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">All certifications are current and regularly renewed. Available for bank / investor due diligence.</p>
            <button className="text-xs border rounded px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap hover:bg-muted">
              <Download className="h-3 w-3" /> Download all certificates
            </button>
          </div>
        </div>
      </section>

      {/* M7: CTA */}
      <section className="bg-emerald-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-2">Ready to see it for yourself?</h2>
          <p className="text-sm text-emerald-300 text-center mb-10">Two ways to take the next step</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <Factory className="h-6 w-6 text-emerald-300 mb-3" />
              <h3 className="text-base font-semibold mb-2">Request a factory visit</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-5">Come see our facility, production lines and team in person. Best for serious buyers, investors and private label partners.</p>
              <div className="space-y-3 mb-5">
                <input placeholder="Your name *" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500" />
                <input placeholder="Company name *" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500" />
                <input placeholder="Phone number *" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500" />
                <input placeholder="Preferred visit date" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500" />
              </div>
              <button className="w-full bg-emerald-600 text-white text-sm font-medium rounded-md py-2.5 hover:bg-emerald-700 transition-colors">Book factory visit →</button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="h-6 w-6 text-amber-400 mb-3 flex items-center justify-center text-lg">📄</div>
              <h3 className="text-base font-semibold mb-2">Get our capability deck</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-5">A detailed PDF covering production capacity, certifications, process, packaging capabilities and MOQ details.</p>
              <div className="space-y-3 mb-5">
                <input placeholder="Your name *" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500" />
                <input placeholder="Business email *" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500" />
                <input placeholder="Company name *" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500" />
                <input placeholder="Phone number" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500" />
              </div>
              <button className="w-full bg-amber-600 text-white text-sm font-medium rounded-md py-2.5 hover:bg-amber-700 transition-colors">Send me the deck →</button>
            </div>
          </div>
          <p className="text-xs text-emerald-300/60 text-center mt-6">Both actions go directly to CRM · sales team alerted · no spam ever</p>
        </div>
      </section>
    </div>
  );
}
