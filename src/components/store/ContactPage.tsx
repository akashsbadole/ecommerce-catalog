'use client';

import { useState } from 'react';
import { Send, Phone, Mail, MapPin, Factory, Clock, MessageCircle, Download, ExternalLink, Package, Box, Truck, TrendingUp, Briefcase, MoreHorizontal } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

const requirementTypes = [
  { id: 'bulk', label: 'Bulk order', icon: Package },
  { id: 'pl', label: 'Private label', icon: Box },
  { id: 'distribution', label: 'Distribution', icon: Truck },
  { id: 'investment', label: 'Investment', icon: TrendingUp },
  { id: 'career', label: 'Career / jobs', icon: Briefcase },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
];

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [selectedType, setSelectedType] = useState('bulk');

  return (
    <div className="flex flex-col">
      {/* CT0: Hero */}
      <section className="bg-gradient-to-br from-[#1C1B2E] to-[#2a2848] text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Get in touch</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Let&apos;s talk about your requirement
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Whether you&apos;re looking for bulk supply, private label manufacturing or a distribution partnership — share your requirement and we&apos;ll respond within 24 hours
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {requirementTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                  selectedType === type.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <type.icon className="h-3.5 w-3.5" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CT1: Form + Sidebar */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left: Form */}
            <div className="flex-[1.4]">
              <h2 className="text-lg font-bold mb-1">Send us your requirement</h2>
              <p className="text-xs text-muted-foreground mb-6">Fields marked * are required. We respond within 24 working hours.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Full name *" className="border rounded-lg px-3 py-2.5 text-sm" />
                  <input placeholder="Company / brand name *" className="border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Phone number * (WhatsApp preferred)" className="border rounded-lg px-3 py-2.5 text-sm" />
                  <input placeholder="Email address *" className="border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="City / state" className="border rounded-lg px-3 py-2.5 text-sm" />
                  <select className="border rounded-lg px-3 py-2.5 text-sm text-muted-foreground">
                    <option>I&apos;m enquiring about ▾</option>
                    {requirementTypes.map((t) => <option key={t.id}>{t.label}</option>)}
                  </select>
                </div>
                {/* Conditional fields */}
                {(selectedType === 'bulk' || selectedType === 'pl') && (
                  <div className="border border-dashed border-primary/40 rounded-lg p-4 bg-primary/5">
                    <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-3">Conditional fields — shown based on enquiry type</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <select className="border border-primary/20 rounded-lg px-3 py-2 text-sm text-muted-foreground bg-background">
                        <option>Product category</option>
                        <option>Khakhra</option>
                        <option>Bhakhri</option>
                        <option>Makhana</option>
                        <option>Extruder</option>
                        <option>Digestive</option>
                      </select>
                      <input placeholder="Approx. monthly qty needed" className="border border-primary/20 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <input placeholder="Preferred pack size / format (optional)" className="w-full border border-primary/20 rounded-lg px-3 py-2 text-sm" />
                  </div>
                )}
                <textarea placeholder="Message — describe your requirement, timeline or any specific ask (optional but helpful)" className="w-full border rounded-lg px-3 py-2.5 text-sm h-24 resize-none" />
                <select className="border rounded-lg px-3 py-2.5 text-sm text-muted-foreground">
                  <option>How did you hear about us? ▾ (optional)</option>
                  <option>Google search</option>
                  <option>Referral</option>
                  <option>Social media</option>
                  <option>Trade show</option>
                  <option>Other</option>
                </select>
                <div className="flex gap-3">
                  <button className="flex-1 bg-primary text-primary-foreground text-sm font-medium rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                    <Send className="h-4 w-4" /> Submit enquiry
                  </button>
                  <button className="bg-emerald-600 text-white text-sm font-medium rounded-lg px-5 py-3 flex items-center gap-2 hover:bg-emerald-700 transition-colors">
                    <MessageCircle className="h-4 w-4" /> WhatsApp instead
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">Your data goes directly to our CRM · sales team alerted instantly · no spam · we respond within 24 hours</p>
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="flex-1 space-y-5">
              {/* Response promise */}
              <div className="bg-emerald-900 text-white rounded-xl p-5">
                <p className="text-sm font-semibold text-emerald-300 mb-4 flex items-center gap-2"><Clock className="h-4 w-4" /> Our response commitment</p>
                <div className="space-y-3">
                  {[
                    { label: 'Bulk / PL enquiries', time: 'Within 4 hours' },
                    { label: 'Distribution enquiries', time: 'Within 24 hours' },
                    { label: 'All other enquiries', time: 'Within 24 hours' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center text-xs border-b border-white/10 pb-2 last:border-0">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-emerald-300 font-medium">{item.time}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-3">Mon–Sat, 9am–6pm IST · WhatsApp available till 8pm</p>
              </div>

              {/* Direct contacts */}
              <div className="border rounded-xl p-5">
                <p className="text-sm font-semibold mb-4 flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Direct contact details</p>
                {[
                  { icon: Mail, color: 'text-primary', label: 'Sales enquiries', value: 'sales@purvabites.com' },
                  { icon: Mail, color: 'text-primary', label: 'General / info', value: 'info@purvabites.com' },
                  { icon: Phone, color: 'text-emerald-600', label: 'Office phone', value: '+91 XXXXX XXXXX', sub: 'Mon–Sat · 9am–6pm IST' },
                  { icon: MessageCircle, color: 'text-emerald-500', label: 'WhatsApp (business)', value: '+91 XXXXX XXXXX', sub: 'Available till 8pm IST' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 py-3 border-b last:border-0">
                    <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-xs font-semibold">{item.label}</p>
                      <p className="text-xs text-primary">{item.value}</p>
                      {item.sub && <p className="text-[10px] text-muted-foreground">{item.sub}</p>}
                    </div>
                  </div>
                ))}
                <div className="mt-3 bg-muted rounded p-2 border-l-2 border-primary">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">We use shared business IDs only — no personal numbers or emails.</p>
                </div>
              </div>

              {/* Company info */}
              <div className="border rounded-xl p-5">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Factory className="h-4 w-4 text-primary" /> Company information</p>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Registered name', value: 'Purva Bites Pvt. Ltd.' },
                    { label: 'CIN', value: 'UXXXXXXXXXXXXX' },
                    { label: 'GST number', value: '24XXXXXXXXX' },
                    { label: 'State', value: 'Gujarat, India' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CT2: Address Cards */}
      <section className="bg-muted/40 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-lg font-bold mb-8">Our locations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background border rounded-xl p-5 border-t-4 border-t-primary">
              <div className="flex items-center gap-2 mb-4">
                <Factory className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Manufacturing facility</p>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-auto">Primary</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                [Factory address line 1]<br />[Area / Industrial estate]<br />[City, District] — [PIN]<br />Gujarat, India
              </p>
              <p className="text-xs text-muted-foreground mb-4">[Station] Xkm · [Airport] Xkm</p>
              <div className="flex gap-2">
                <button className="text-[10px] border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"><MapPin className="h-3 w-3" /> Get directions</button>
                <button className="text-[10px] border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"><Factory className="h-3 w-3" /> Book visit</button>
              </div>
            </div>
            <div className="bg-background border rounded-xl p-5 border-t-4 border-t-muted">
              <div className="flex items-center gap-2 mb-4">
                <Factory className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-semibold">Registered / corporate office</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                [Office address line 1]<br />[Area / Colony]<br />[City] — [PIN]<br />Gujarat, India
              </p>
              <p className="text-xs text-muted-foreground mb-4">Mon–Sat · 9am–6pm IST</p>
              <button className="text-[10px] border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"><MapPin className="h-3 w-3" /> Get directions</button>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 border-t-4 border-t-emerald-600">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <p className="text-sm font-semibold">Planning a factory visit?</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                We welcome B2B buyers, private label partners and investors to visit our facility. Please schedule in advance.
              </p>
              <div className="space-y-2 mb-5">
                {['Full production line walkthrough', 'Warehouse & dispatch area tour', 'Meet the directors in person', 'Product sampling on request'].map((item) => (
                  <p key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="text-emerald-600">✓</span> {item}
                  </p>
                ))}
              </div>
              <button onClick={() => onNavigate('manufacturing')} className="w-full bg-emerald-600 text-white text-xs font-medium rounded py-2.5 hover:bg-emerald-700 transition-colors">
                Schedule a factory visit →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CT4: Quick Connect */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-lg font-bold mb-8">Prefer a quicker channel?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'WhatsApp us', desc: 'Quick questions, product photos, sample requests', value: '+91 XXXXX XXXXX', cta: 'Open WhatsApp chat →', ctaBg: 'bg-emerald-600 text-white' },
              { icon: Phone, color: 'text-primary', bg: 'bg-background', border: 'border-border', title: 'Call us directly', desc: 'For urgent requirements or to speak to someone', value: '+91 XXXXX XXXXX', cta: 'Tap to call', ctaBg: 'bg-primary text-primary-foreground' },
              { icon: Mail, color: 'text-amber-600', bg: 'bg-background', border: 'border-border', title: 'Email us', desc: 'For detailed enquiries, capability requests', value: 'sales@purvabites.com', cta: 'Copy email address', ctaBg: 'bg-amber-600 text-white' },
              { icon: Download, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20', title: 'Not ready to call yet?', desc: 'Download our product & capability catalogue', value: 'PDF · 24 pages · free', cta: 'Get catalogue', ctaBg: 'bg-primary text-primary-foreground' },
            ].map((item) => (
              <div key={item.title} className={`${item.bg} ${item.border} border rounded-xl p-5 text-center`}>
                <item.icon className={`h-8 w-8 ${item.color} mx-auto mb-3`} />
                <p className="text-sm font-semibold mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
                <p className={`text-sm font-medium mb-3 ${item.color}`}>{item.value}</p>
                <button className={`w-full text-xs font-medium rounded py-2.5 ${item.ctaBg} transition-colors hover:opacity-90`}>
                  {item.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CT5: CRM Flow */}
      <section className="bg-emerald-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-lg font-bold text-center mb-8">What happens after you get in touch</h2>
          <div className="grid grid-cols-5 gap-0">
            {[
              { num: '1', color: 'bg-primary', title: 'Enquiry received', desc: 'Form submission or WhatsApp message logged in CRM automatically' },
              { num: '2', color: 'bg-primary/80', title: 'Auto-acknowledgement', desc: 'You receive an email confirmation within minutes' },
              { num: '3', color: 'bg-emerald-600', title: 'Sales team review', desc: 'Enquiry categorised by type — routed to the right person' },
              { num: '4', color: 'bg-amber-600', title: 'First response', desc: 'Call or WhatsApp within 4–24 hours depending on enquiry type' },
              { num: '5', color: 'bg-blue-600', title: 'Proposal / sample', desc: 'Pricing, capability deck or sample dispatch as per your requirement' },
            ].map((step, i) => (
              <div key={step.num} className={`text-center px-3 ${i < 4 ? 'border-r border-white/10' : ''}`}>
                <div className={`w-8 h-8 rounded-full ${step.color} flex items-center justify-center mx-auto mb-3 text-xs font-bold`}>{step.num}</div>
                <p className="text-xs font-semibold mb-1">{step.title}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
