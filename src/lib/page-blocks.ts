export type BlockType = 'hero' | 'features' | 'cta' | 'testimonials' | 'image-gallery' | 'text' | 'spacer' | 'divider' | 'products' | 'faq';

export interface PageBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export const BLOCK_DEFAULTS: Record<BlockType, { label: string; icon: string; defaultData: Record<string, unknown> }> = {
  hero: {
    label: 'Hero Banner',
    icon: 'Image',
    defaultData: {
      title: 'Welcome',
      subtitle: '',
      buttonText: 'Learn More',
      buttonLink: '/catalogue',
      backgroundImage: '',
      height: 'medium',
      alignment: 'center',
    },
  },
  features: {
    label: 'Features Grid',
    icon: 'LayoutGrid',
    defaultData: {
      title: 'Our Features',
      columns: 3,
      features: [{ title: 'Feature 1', description: 'Description', icon: 'Star' }],
    },
  },
  cta: {
    label: 'Call to Action',
    icon: 'MousePointerClick',
    defaultData: {
      title: 'Get Started Today',
      description: 'Sign up now',
      buttonText: 'Sign Up',
      buttonLink: '/contact',
      backgroundColor: 'emerald',
    },
  },
  testimonials: {
    label: 'Testimonials',
    icon: 'Quote',
    defaultData: {
      title: 'What Our Clients Say',
      testimonials: [{ name: 'John Doe', role: 'CEO', quote: 'Great product!', avatar: '' }],
    },
  },
  'image-gallery': {
    label: 'Image Gallery',
    icon: 'Images',
    defaultData: {
      title: 'Gallery',
      columns: 3,
      images: [''],
    },
  },
  text: {
    label: 'Text Block',
    icon: 'Type',
    defaultData: {
      content: '<p>Enter your text here...</p>',
    },
  },
  spacer: {
    label: 'Spacer',
    icon: 'MoveVertical',
    defaultData: {
      height: 64,
    },
  },
  divider: {
    label: 'Divider',
    icon: 'Minus',
    defaultData: {
      style: 'solid',
    },
  },
  products: {
    label: 'Product Showcase',
    icon: 'Package',
    defaultData: {
      title: 'Featured Products',
      maxProducts: 6,
      layout: 'grid',
    },
  },
  faq: {
    label: 'FAQ Section',
    icon: 'HelpCircle',
    defaultData: {
      title: 'Frequently Asked Questions',
      items: [{ question: 'Question?', answer: 'Answer.' }],
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
