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
  | "crm-flow";

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
      title: "Welcome",
      subtitle: "",
      buttonText: "Learn More",
      buttonLink: "/catalogue",
      backgroundImage: "",
      height: "medium",
      alignment: "center",
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
      ],
      ctaText: "View all products & packaging",
      ctaLink: "/catalogue",
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
};

export function createBlock(type: BlockType): PageBlock {
  const defaults = BLOCK_DEFAULTS[type];
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    data: { ...defaults.defaultData },
  };
}
