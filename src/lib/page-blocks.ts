export type BlockType =
  | "hero"
  | "features"
  | "cta"
  | "testimonials"
  | "image-gallery"
  | "text"
  | "spacer"
  | "divider"
  | "products"
  | "faq"
  | "slider"
  | "product-carousel"
  | "about"
  | "trust-bar"
  | "audience-cards"
  | "capabilities"
  | "product-categories"
  | "factory-reel"
  | "certifications"
  | "lead-capture"
  | "leadership"
  | "partner-logos"
  | "sticky-cta"
  | "blog-grid"
  | "pricing-table"
  | "hero-split"
  | "timeline"
  | "metrics-bar"
  | "process-flow"
  | "packaging-grid"
  | "certification-cards"
  | "address-cards"
  | "quick-connect"
  | "crm-flow"
  | "about-page-content"
  | "mfg-page-content"
  | "contact-page-content"
  | "catalogue-page-content"
;

export interface PageBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export const BLOCK_DEFAULTS: Record<
  BlockType,
  { label: string; icon: string; defaultData: Record<string, unknown> }
> = {
  hero: {
    label: "Hero Banner",
    icon: "Image",
    defaultData: {
      title: "",
      subtitle: "",
      items: [
        {
          image: "",
          title: "Slide 1",
          subtitle: "Description",
          buttonText: "Learn More",
          buttonLink: "/catalogue",
        },
      ],
      height: "medium",
      alignment: "center",
      autoplay: true,
      interval: 5000,
      showArrows: true,
      showDots: true,
    },
  },
  features: {
    label: "Features Grid",
    icon: "LayoutGrid",
    defaultData: {
      title: "Our Features",
      columns: 3,
      features: [
        { title: "Feature 1", description: "Description", icon: "Star" },
      ],
    },
  },
  cta: {
    label: "Call to Action",
    icon: "MousePointerClick",
    defaultData: {
      title: "Get Started Today",
      description: "Sign up now",
      buttonText: "Sign Up",
      buttonLink: "/contact",
      backgroundColor: "emerald",
    },
  },
  testimonials: {
    label: "Testimonials",
    icon: "Quote",
    defaultData: {
      title: "What Our Clients Say",
      testimonials: [
        { name: "John Doe", role: "CEO", quote: "Great product!", avatar: "" },
      ],
    },
  },
  "image-gallery": {
    label: "Image Gallery",
    icon: "Images",
    defaultData: {
      title: "Gallery",
      columns: 3,
      images: [""],
    },
  },
  text: {
    label: "Text Block",
    icon: "Type",
    defaultData: {
      content: "<p>Enter your text here...</p>",
    },
  },
  spacer: {
    label: "Spacer",
    icon: "MoveVertical",
    defaultData: {
      height: 64,
    },
  },
  divider: {
    label: "Divider",
    icon: "Minus",
    defaultData: {
      style: "solid",
    },
  },
  products: {
    label: "Product Showcase",
    icon: "Package",
    defaultData: {
      title: "Featured Products",
      maxProducts: 6,
      layout: "grid",
    },
  },
  faq: {
    label: "FAQ Section",
    icon: "HelpCircle",
    defaultData: {
      title: "Frequently Asked Questions",
      items: [{ question: "Question?", answer: "Answer." }],
    },
  },
  slider: {
    label: "Image Slider",
    icon: "GalleryHorizontal",
    defaultData: {
      items: [
        { image: "", title: "Slide 1", subtitle: "Description 1", link: "" },
      ],
      autoplay: true,
      interval: 5000,
      ctaButtonColor: "#2639ED",
      ctaTextColor: "#FFFFFF",
      showButton: true,
      fullWidth: true,
    },
  },
  "product-carousel": {
    label: "Product Carousel",
    icon: "Layers",
    defaultData: {
      title: "Our Products",
      maxProducts: 10,
      categoryId: "",
    },
  },
  about: {
    label: "About Section",
    icon: "User",
    defaultData: {
      title: "About Us",
      content: "<p>Tell your story here...</p>",
      image: "",
      imagePosition: "left",
      buttonText: "Read More",
      buttonLink: "",
    },
  },
  "trust-bar": {
    label: "Trust Numbers Bar",
    icon: "TrendingUp",
    defaultData: {
      stats: [
        { value: 15, suffix: "+", label: "Years in manufacturing" },
        { value: 5000, suffix: "+", label: "MT annual capacity" },
        { value: 80, suffix: "+", label: "SKUs across categories" },
        { value: 12, suffix: "+", label: "States served" },
        { value: 100, suffix: "%", label: "Own manufacturing" },
      ],
    },
  },
  "audience-cards": {
    label: "Who We Serve",
    icon: "Users",
    defaultData: {
      label: "Who we serve",
      heading: "We manufacture for",
      description: "From first batch to full-scale production",
      ctaButtonColor: "#2639ED",
      ctaTextColor: "#FFFFFF",
      showButton: true,
      cards: [
        {
          title: "B2B brands",
          description: "Bulk supply of finished goods under your brand",
          cta: "Enquire now",
          link: "/contact",
        },
        {
          title: "Private label",
          description: "Custom packaging, your branding, our recipe",
          cta: "Get details",
          link: "/contact",
        },
        {
          title: "Distributors",
          description: "Trade pricing, consistent supply, multi-SKU range",
          cta: "Partner with us",
          link: "/contact",
        },
        {
          title: "Institutional buyers",
          description: "Canteens, airlines, hospitality, govt procurement",
          cta: "Send requirement",
          link: "/contact",
        },
      ],
    },
  },
  capabilities: {
    label: "Manufacturing Capabilities",
    icon: "Factory",
    defaultData: {
      label: "Manufacturing capabilities",
      heading: "Why partner with us",
      items: [
        "Own factory & machinery",
        "FSSAI & ISO certified",
        "5 production lines",
        "Custom packaging ready",
        "Hygiene-first processes",
        "On-time delivery",
      ],
      image: "",
      videoUrl: "",
      imageCaption: "Facility / production line image",
      ctaText: "View full capabilities",
      ctaLink: "/page/manufacturing",
    },
  },
  "product-categories": {
    label: "Product Category Preview",
    icon: "LayoutGrid",
    defaultData: {
      label: "Our product range",
      heading: "Product categories",
      description:
        "Manufactured in-house · available for bulk, private label & contract production",
      categories: [
        { name: "Khakhra", variants: "12+ variants" },
        { name: "Bhakhri", variants: "8+ variants" },
        { name: "Makhana", variants: "10+ variants" },
        { name: "Extruder products", variants: "6+ variants" },
        { name: "Digestive", variants: "4+ variants" },
        { name: "Namkeen", variants: "8+ variants" },
      ],
      ctaText: "View all products & packaging",
      ctaLink: "/catalogue",
      ctaButtonColor: "#2639ED",
      ctaTextColor: "#FFFFFF",
      showButton: true,
    },
  },
  "factory-reel": {
    label: "Factory & Facility Reel",
    icon: "Video",
    defaultData: {
      label: "Factory & facility reel",
      heading: "See our facility in action",
      description:
        "Factory floor · machinery · warehouse · loading trucks · staff · hygiene systems",
      videoUrl: "",
      thumbnailUrl: "",
      ctaText: "Watch full factory tour",
      ctaLink: "/page/manufacturing",
    },
  },
  certifications: {
    label: "Certifications & Compliance",
    icon: "Award",
    defaultData: {
      label: "Certifications & compliance",
      heading: "Certified. Compliant. Trusted.",
      items: ["FSSAI", "ISO", "BIS", "HACCP", "GMP"],
      ctaText: "View all certifications",
      ctaLink: "/page/manufacturing",
    },
  },
  "lead-capture": {
    label: "Lead Capture Form",
    icon: "FormInput",
    defaultData: {
      label: "Looking for a manufacturing partner?",
      heading: "Let's talk manufacturing",
      description: "Tell us your requirement — we'll get back within 24 hours",
      successMessage: "Enquiry submitted! We'll call you back within 24 hours.",
      apiEndpoint: "/api/enquiries",
      submitText: "Submit enquiry — we'll call you back",
      disclaimer:
        "Data goes directly to CRM · sales team alerted instantly · no spam",
      fields: [
        {
          name: "name",
          label: "Your name",
          type: "text",
          required: true,
          placeholder: "Your name *",
        },
        {
          name: "company",
          label: "Company name",
          type: "text",
          required: true,
          placeholder: "Company name *",
        },
        {
          name: "phone",
          label: "Phone number",
          type: "tel",
          required: true,
          placeholder: "Phone number *",
        },
        {
          name: "email",
          label: "Email address",
          type: "email",
          required: false,
          placeholder: "Email address",
        },
        {
          name: "requirement",
          label: "Requirement type",
          type: "select",
          required: false,
          placeholder: "Requirement type",
          options: [
            "Bulk order",
            "Private label",
            "Distribution",
            "Investment",
            "Other",
          ],
        },
        {
          name: "city",
          label: "City / state",
          type: "text",
          required: false,
          placeholder: "City / state",
        },
      ],
      messageField: true,
    },
  },
  leadership: {
    label: "Leadership",
    icon: "UserCircle",
    defaultData: {
      label: "Leadership",
      heading: "Meet the leadership",
      ctaText: "Read full story",
      ctaLink: "/page/about-us",
      members: [
        {
          name: "Director name",
          role: "Co-founder & Director",
          bio: "20+ yrs FMCG distribution background. Placeholder bio line.",
          image: "",
        },
        {
          name: "Director name",
          role: "Co-founder & Director",
          bio: "Operations & manufacturing lead. Placeholder bio line.",
          image: "",
        },
      ],
    },
  },
  "partner-logos": {
    label: "Partner Logos",
    icon: "Building",
    defaultData: {
      heading: "Trusted by brands across India",
      logos: ["", "", ""],
      testimonials: [
        {
          quote:
            '"Consistent quality, on-time delivery. Best manufacturing partner we\'ve worked with."',
          author: "Brand name, City",
        },
        {
          quote:
            '"Private label setup was smooth, packaging was exactly what we needed for retail."',
          author: "Distributor name, State",
        },
        {
          quote:
            '"Scale, hygiene standards and response time — all top class. Highly recommended."',
          author: "Company name, State",
        },
      ],
    },
  },
  "blog-grid": {
    label: "Blog Grid",
    icon: "Newspaper",
    defaultData: {
      title: "Latest from our blog",
      maxPosts: 6,
      layout: "grid",
      categoryId: "",
      showFeatured: true,
    },
  },
  "pricing-table": {
    label: "Pricing Table",
    icon: "CreditCard",
    defaultData: {
      title: "Our Pricing",
      description: "Choose the plan that suits your needs",
      tiers: [
        {
          name: "Basic",
          price: "₹___",
          description: "For small businesses",
          features: ["Feature 1", "Feature 2", "Feature 3"],
          ctaText: "Get started",
          ctaLink: "/contact",
          highlighted: false,
        },
        {
          name: "Professional",
          price: "₹___",
          description: "For growing companies",
          features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
          ctaText: "Get started",
          ctaLink: "/contact",
          highlighted: true,
        },
        {
          name: "Enterprise",
          price: "Custom",
          description: "For large organizations",
          features: [
            "Feature 1",
            "Feature 2",
            "Feature 3",
            "Feature 4",
            "Feature 5",
          ],
          ctaText: "Contact us",
          ctaLink: "/contact",
          highlighted: false,
        },
      ],
    },
  },
  "sticky-cta": {
    label: "Sticky CTA Bar",
    icon: "ArrowDownToLine",
    defaultData: {
      visible: false,
      text: "Ready to manufacture at scale?",
      buttons: [
        {
          text: "Get bulk quote",
          type: "primary",
          action: "enquiry",
          link: "/contact",
        },
        {
          text: "WhatsApp us",
          type: "whatsapp",
          action: "whatsapp",
          link: "https://wa.me/91XXXXXXXXXX",
        },
        {
          text: "+91 XXXXX XXXXX",
          type: "phone",
          action: "phone",
          link: "tel:+91XXXXXXXXXX",
        },
      ],
    },
  },
  "hero-split": {
    label: "Hero Split",
    icon: "Columns",
    defaultData: {
      title: "Your headline here",
      subtitle: "Supporting text goes here",
      description: "",
      backgroundImage: "",
      height: "medium",
      alignment: "left",
      buttons: [
        { text: "Primary CTA", link: "/contact", variant: "primary" },
        { text: "Secondary CTA", link: "/catalogue", variant: "outline" },
      ],
      badges: [],
      ctaButtonColor: "#2639ED",
      ctaTextColor: "#FFFFFF",
      showButton: true,
      fullWidth: true,
    },
  },
  timeline: {
    label: "Timeline",
    icon: "GitBranch",
    defaultData: {
      title: "Our Journey",
      subtitle: "How we got here",
      items: [
        { year: "2010", title: "Founded", description: "Company established." },
        { year: "2015", title: "Expansion", description: "New facility and production lines." },
        { year: "Today", title: "Growing", description: "Serving brands across India.", current: true },
      ],
    },
  },
  "metrics-bar": {
    label: "Metrics Bar",
    icon: "BarChart3",
    defaultData: {
      stats: [
        { value: "5", label: "Production lines" },
        { value: "5,000+", label: "MT / year capacity" },
        { value: "80+", label: "Active SKUs" },
        { value: "15+", label: "Years experience" },
      ],
    },
  },
  "process-flow": {
    label: "Process Flow",
    icon: "GitMerge",
    defaultData: {
      title: "Our Process",
      subtitle: "From start to finish",
      steps: [
        { title: "Step 1", description: "Description of step 1", icon: "ClipboardCheck" },
        { title: "Step 2", description: "Description of step 2", icon: "Settings" },
        { title: "Step 3", description: "Description of step 3", icon: "CheckCircle" },
      ],
      trustItems: ["Quality assured", "Batch tracked", "Certified process"],
    },
  },
  "packaging-grid": {
    label: "Packaging Grid",
    icon: "Package",
    defaultData: {
      title: "Packaging formats",
      subtitle: "Choose what works for your business",
      items: [
        { title: "Branded retail", description: "Ready-branded packs for distributors", tag: "Distributor friendly", highlight: false },
        { title: "Private label", description: "Your brand, our manufacturing", tag: "Most requested", highlight: true },
        { title: "Bulk / institutional", description: "5kg, 10kg, 25kg formats", tag: "Bulk format", highlight: false },
      ],
    },
  },
  "certification-cards": {
    label: "Certification Cards",
    icon: "Award",
    defaultData: {
      title: "Certified. Audited. Trusted.",
      certs: [
        { name: "FSSAI", description: "Food safety & standards authority" },
        { name: "ISO", description: "Quality management systems" },
        { name: "BIS", description: "Bureau of Indian standards" },
      ],
      footerText: "All certifications are current and regularly renewed.",
    },
  },
  "address-cards": {
    label: "Address Cards",
    icon: "MapPin",
    defaultData: {
      title: "Our locations",
      cards: [
        { type: "factory", title: "Manufacturing facility", address: "[Factory address]", badge: "Primary" },
        { type: "office", title: "Corporate office", address: "[Office address]", badge: "" },
        { type: "visit", title: "Planning a factory visit?", description: "We welcome B2B buyers to visit our facility." },
      ],
    },
  },
  "quick-connect": {
    label: "Quick Connect",
    icon: "Phone",
    defaultData: {
      title: "Prefer a quicker channel?",
      channels: [
        { type: "whatsapp", title: "WhatsApp us", description: "Quick questions, product photos", value: "+91 XXXXX XXXXX" },
        { type: "phone", title: "Call us directly", description: "For urgent requirements", value: "+91 XXXXX XXXXX" },
        { type: "email", title: "Email us", description: "For detailed enquiries", value: "sales@purvabites.com" },
        { type: "catalogue", title: "Download catalogue", description: "Review at your own pace", value: "PDF · 24 pages · free" },
      ],
    },
  },
  "crm-flow": {
    label: "CRM Flow",
    icon: "Workflow",
    defaultData: {
      title: "What happens after you get in touch",
      steps: [
        { num: 1, title: "Enquiry received", description: "Logged in CRM automatically" },
        { num: 2, title: "Auto-acknowledgement", description: "Email confirmation within minutes" },
        { num: 3, title: "Sales team review", description: "Routed to the right person" },
        { num: 4, title: "First response", description: "Call or WhatsApp within 4-24 hours" },
        { num: 5, title: "Proposal / sample", description: "Pricing or sample dispatch" },
      ],
    },
  },
  "about-page-content": {
    label: "About Page Content",
    icon: "FileText",
    defaultData: {
      hero: { title: "Built on trust. Driven by quality.", subtitle: "From a distribution background to a full-scale FMCG manufacturing company — the Purva Bites story is one of conviction and craft", estYear: "Est. 2010 · Gujarat, India" },
      stats: [
        { value: "15+", label: "Years in business" },
        { value: "100%", label: "Own manufacturing" },
        { value: "12+", label: "States served" },
        { value: "5", label: "Production lines" },
      ],
      story: {
        heading: "How we got here",
        subtitle: "A business built from the ground up — from distribution to manufacturing",
        narrative: [
          "The founders began their journey in FMCG distribution — supplying established snack brands across Gujarat and building deep knowledge of what retailers, distributors and consumers actually want from a product.",
          "That ground-level experience became the foundation for Purva Bites. Rather than representing other manufacturers, they built their own — starting with a single Khakhra line and methodically expanding to 5 production categories over 15 years.",
          "Today, Purva Bites manufactures for brands, private label clients and distributors who want the reliability of a proven partner — not just a contract factory.",
        ],
        ctaText: "Meet the founders →",
        ctaPage: "manufacturing",
        timeline: [
          { year: "2010", title: "Founded", desc: "Company established. First Khakhra production line commissioned." },
          { year: "2013", title: "FSSAI certification", desc: "Received FSSAI licence. Expanded to Bhakhri and Makhana lines." },
          { year: "2017", title: "Factory expansion", desc: "New facility with dedicated warehouse and loading infrastructure." },
          { year: "2020", title: "Private label launch", desc: "Started contract manufacturing and private label services for B2B clients." },
          { year: "Today", title: "5 lines · 80+ SKUs · 12+ states", desc: "Serving brands, distributors and private label partners across India.", current: true },
        ],
      },
      directors: [
        { name: "[Director name]", role: "Co-founder & Managing Director", bio: "20+ years in FMCG distribution across Gujarat. Deep knowledge of supply chains, trade networks and what manufacturing partners actually owe their clients.", imageUrl: "" },
        { name: "[Director name]", role: "Co-founder & Operations Director", bio: "Leads day-to-day manufacturing operations, quality systems and production planning. Oversees all 5 production lines, warehouse and dispatch.", imageUrl: "" },
      ],
      quote: { text: "\"We started by selling other people's products. Then we decided to build something we could stand behind completely.\"", author: "[Director name], Co-founder" },
      ctaCard: { title: "Direct access to leadership", desc: "Our directors are directly involved in client conversations — especially for private label and large-volume partnerships.", cta: "Speak to us directly →" },
      missionVisionValues: [
        { icon: "Target", color: "text-primary", bg: "bg-primary/10", label: "Mission", title: "Make Indian snacks at the quality global brands demand", desc: "To manufacture FMCG products that meet the highest standards of consistency, hygiene and taste — enabling brands of all sizes to bring quality to their customers." },
        { icon: "Eye", color: "text-emerald-600", bg: "bg-emerald-50", label: "Vision", title: "Become India's most trusted FMCG contract manufacturer", desc: "To be the manufacturing partner of choice for emerging and established FMCG brands — known for reliability, transparency and manufacturing excellence." },
        { icon: "HeartHandshake", color: "text-amber-600", bg: "bg-amber-50", label: "Values", title: "Quality first · Transparency always · Partnership mindset", desc: "We don't just fulfill orders — we build long-term manufacturing relationships. Honest about capacity, proactive about issues, consistent in delivery." },
      ],
      location: {
        factoryAddress: "[Factory address line 1]\n[City, District] — [PIN code]\nGujarat, India",
        logistics: [
          { icon: "Train", label: "Nearest railway station", value: "[Station] — X km" },
          { icon: "Plane", label: "Nearest airport", value: "[Airport] — X km" },
          { icon: "Route", label: "Nearest highway", value: "NH-[X] — X km" },
          { icon: "Factory", label: "Nearest major city", value: "[City] — X km" },
        ],
        dispatchTags: ["Pan-India dispatch", "Road + rail", "Batch-tracked"],
        dispatchDesc: "We dispatch to all major markets across India via road and rail freight. Consignments dispatched within agreed lead times.",
      },
      cta: {
        title: "Ready to work with us?",
        cards: [
          { icon: "Factory", title: "See our manufacturing", desc: "Tour our 5 production lines, certifications and capability", cta: "View manufacturing →", page: "manufacturing" },
          { icon: "Target", title: "Get our catalogue", desc: "80+ SKUs, capacity details and packaging formats in one PDF", cta: "Download free →", page: "catalogue" },
          { icon: "Linkedin", title: "Partner with us", desc: "Bulk order, private label or distribution enquiry — start here", cta: "Send enquiry →", page: "contact" },
        ],
      },
    },
  },
  "mfg-page-content": {
    label: "Manufacturing Page Content",
    icon: "Factory",
    defaultData: {
      hero: {
        title: "State-of-the-art FMCG contract manufacturing",
        subtitle: "From raw material to finished, packaged goods — at scale, with precision, under one roof in Gujarat",
        badge: "FSSAI certified · ISO compliant · 100% own manufacturing",
        buttons: [
          { text: "Request a factory visit", page: "contact", variant: "primary" },
          { text: "Download capability deck", variant: "outline" },
        ],
      },
      metrics: [
        { value: "5", label: "Production lines" },
        { value: "5,000+", label: "MT / year capacity" },
        { value: "80+", label: "Active SKUs" },
        { value: "15+", label: "Years experience" },
      ],
      intro: { heading: "Built to manufacture. Not to outsource.", description: "Every product that leaves our facility is made in-house — on our machinery, by our team, under our quality controls. We operate 5 dedicated production lines with a combined annual capacity exceeding 5,000 MT, serving brands, distributors and private label partners across India." },
      productionLines: [
        { id: "khakhra", name: "Khakhra line", flagship: true, capacity: "X,XXX kg", variants: "12+ flavours", packs: "30g · 80g · 200g · bulk", desc: "Fully automated rolling and roasting machinery. Consistent thickness, texture and flavour across batches. Available in plain, masala, methi, jeera and custom flavour profiles for private label.", tags: ["Automated rolling", "Precision roasting", "Auto weighing", "Custom flavour ready"] },
        { id: "bhakhri", name: "Bhakhri line", flagship: false, capacity: "X,XXX kg", variants: "8+ varieties", packs: "80g · 200g · bulk", desc: "Traditional recipes with modern automation. Consistent thickness and crunch across batches. Available in multiple grain compositions.", tags: ["Traditional recipe", "Auto sheeting", "Uniform baking"] },
        { id: "makhana", name: "Makhana line", flagship: false, capacity: "X,XXX kg", variants: "6+ flavours", packs: "30g · 80g · 200g · bulk", desc: "Specialised roasting and flavouring line for fox nuts. Light, crispy finish with even coating across all flavour variants.", tags: ["Low-oil roasting", "Even coating", "Flavour infusion"] },
        { id: "extruder", name: "Extruder line", flagship: false, capacity: "X,XXX kg", variants: "10+ shapes", packs: "30g · 80g · 200g · bulk", desc: "High-speed extrusion for puffed and shaped snacks. Custom shapes and textures achievable for private label clients.", tags: ["Custom shapes", "High-speed", "Texture control"] },
        { id: "digestive", name: "Digestive line", flagship: false, capacity: "X,XXX kg", variants: "5+ varieties", packs: "80g · 200g · bulk", desc: "Baked digestive biscuits and health-focused snacks. Formulations customisable for target nutrition profiles.", tags: ["Baked not fried", "Health-focused", "Custom nutrition"] },
      ],
      qualitySteps: [
        { icon: "Leaf", color: "bg-primary/10 text-primary", title: "Raw material intake", desc: "Supplier grading, moisture check, lab testing before acceptance" },
        { icon: "Filter", color: "bg-emerald-50 text-emerald-600", title: "Cleaning & prep", desc: "Sieving, washing, pre-treatment as per product spec" },
        { icon: "Flame", color: "bg-amber-50 text-amber-600", title: "Production", desc: "Automated processing on dedicated line — controlled temp, time, texture" },
        { icon: "Microscope", color: "bg-orange-50 text-orange-600", title: "In-line QC checks", desc: "Colour, texture, weight, taste checks at every 30 min intervals" },
        { icon: "Package", color: "bg-blue-50 text-blue-600", title: "Packaging", desc: "Auto-fill, seal, label — Purva Bites or custom private label pack" },
        { icon: "Truck", color: "bg-green-50 text-green-700", title: "Dispatch", desc: "Lot-tagged, batch-coded, climate-appropriate loading & dispatch" },
      ],
      qualityFooterItems: ["Batch traceability maintained", "Staff in hygienic uniforms & gloves", "CCTV-monitored production areas", "Third-party lab testing on request"],
      privateLabel: {
        heading: "Your brand. Our factory.",
        subtitle: "We handle the entire manufacturing and packaging process — you bring the brand identity",
        items: [
          { icon: "Package", title: "Custom packaging", desc: "Supply your artwork / brief — we print and pack under your brand name, barcode and design" },
          { icon: "Settings", title: "Custom formulation", desc: "Adjust flavour, spice levels, ingredients to match your product brief and target market" },
          { icon: "ShieldCheck", title: "Regulatory compliance handled", desc: "FSSAI declaration, nutritional labels, batch coding — all managed at our end" },
        ],
        details: [
          { label: "Minimum order qty (MOQ)", value: "As per product — share requirement" },
          { label: "Lead time (first batch)", value: "15–21 working days" },
          { label: "Pack size flexibility", value: "10g to 1kg — all sizes" },
          { label: "NDA / confidentiality", value: "Available on request" },
          { label: "Sample order", value: "Available before bulk" },
        ],
        ctaText: "Enquire for private label →",
      },
      certifications: [
        { name: "FSSAI licence", desc: "Food safety & standards authority" },
        { name: "ISO certification", desc: "Quality management systems" },
        { name: "BIS certification", desc: "Bureau of Indian standards" },
        { name: "Other certification", desc: "To be added by client" },
      ],
      cta: {
        title: "Ready to see it for yourself?",
        subtitle: "Share your details — we'll get back within 24 hours",
      },
    },
  },
  "contact-page-content": {
    label: "Contact Page Content",
    icon: "Mail",
    defaultData: {
      hero: {
        title: "Let's talk about your requirement",
        subtitle: "Whether you're looking for bulk supply, private label manufacturing or a distribution partnership — share your requirement and we'll respond within 24 hours",
        requirementTypes: [
          { id: "bulk", label: "Bulk order", icon: "Package" },
          { id: "pl", label: "Private label", icon: "Box" },
          { id: "distribution", label: "Distribution", icon: "Truck" },
          { id: "investment", label: "Investment", icon: "TrendingUp" },
          { id: "career", label: "Career / jobs", icon: "Briefcase" },
          { id: "other", label: "Other", icon: "MoreHorizontal" },
        ],
      },
      formSection: {
        title: "Send us your requirement",
        subtitle: "Fields marked * are required. We respond within 24 working hours.",
      },
      responsePromise: {
        title: "Our response commitment",
        items: [
          { label: "Bulk / PL enquiries", time: "Within 4 hours" },
          { label: "Distribution enquiries", time: "Within 24 hours" },
          { label: "All other enquiries", time: "Within 24 hours" },
        ],
        footer: "Mon–Sat, 9am–6pm IST",
      },
      locations: {
        title: "Our locations",
        cards: [
          { type: "factory", title: "Manufacturing facility", subtitle: "Primary", address: "[Factory address line 1]\n[Area / Industrial estate]\n[City, District] — [PIN]\nGujarat, India", accessibility: "[Station] Xkm · [Airport] Xkm", buttons: [{ text: "Get directions", icon: "MapPin" }, { text: "Book visit", icon: "Factory" }] },
          { type: "office", title: "Registered / corporate office", subtitle: "", address: "[Office address line 1]\n[Area / Colony]\n[City] — [PIN]\nGujarat, India", accessibility: "Mon–Sat · 9am–6pm IST", buttons: [{ text: "Get directions", icon: "MapPin" }] },
          { type: "visit", title: "Planning a factory visit?", subtitle: "", description: "We welcome B2B buyers, private label partners and investors to visit our facility. Please schedule in advance.", highlights: ["Full production line walkthrough", "Warehouse & dispatch area tour", "Meet the directors in person", "Product sampling on request"], cta: "Schedule a factory visit →" },
        ],
      },
    },
  },
  "catalogue-page-content": {
    label: "Catalogue Page Content",
    icon: "Package",
    defaultData: {
      categoryInfo: {
        khakhra: { tags: ["12+ variants", "Private label"], desc: "Thin, crispy, roasted flatbreads available in a wide range of flavours and spice levels. One of our flagship lines — highest daily output capacity. Ideal for B2B, retail brands and private label." },
        bhakhri: { tags: ["8+ varieties"], desc: "Traditional recipes with modern automation. Consistent thickness and crunch across batches. Available in multiple grain compositions." },
        makhana: { tags: ["6+ flavours", "PL ready"], desc: "Specialised roasting and flavouring line for fox nuts. Light, crispy finish with even coating across all flavour variants." },
        extruder: { tags: ["10+ shapes"], desc: "High-speed extrusion for puffed and shaped snacks. Custom shapes and textures achievable for private label clients." },
        digestive: { tags: ["5+ varieties"], desc: "Baked digestive biscuits and health-focused snacks. Formulations customisable for target nutrition profiles." },
      },
      packagingOptions: [
        { title: "Purva Bites branded", desc: "Ready-branded packs for distributors, modern trade and institutional buyers", tag: "Distributor friendly", highlight: false },
        { title: "Your brand / private label", desc: "Send your artwork — we print, pack and ship under your brand identity. No minimums disclosed publicly.", tag: "Private label", highlight: true },
        { title: "Bulk / institutional", desc: "5kg, 10kg, 25kg formats for canteens, hotels, airlines and govt procurement", tag: "Bulk format", highlight: false },
      ],
      categoryTabs: [
        { id: "all", label: "All products" },
        { id: "khakhra", label: "Khakhra" },
        { id: "bhakhri", label: "Bhakhri" },
        { id: "makhana", label: "Makhana" },
        { id: "extruder", label: "Extruder" },
        { id: "digestive", label: "Digestive" },
      ],
    },
  },
};

export function createBlock(type: BlockType): PageBlock {
  const defaults = BLOCK_DEFAULTS[type];
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    data: { ...defaults.defaultData },
  };
}
