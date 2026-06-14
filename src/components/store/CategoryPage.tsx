'use client';

import { useState, useEffect } from 'react';
import { Package, Send, Check, Image as ImageIcon, Shield, Truck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SharedContactForm } from './SharedContactForm';
import { PageBlockRenderer } from './PageBlockRenderer';
import { useContentPage, getBlockData } from '@/lib/use-page-content';

interface CategoryPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
}

const trustIcons = [Shield, Truck, Award];
const trustLabels = ['FSSAI certified', 'Pan-India dispatch', 'Bulk & private label'];

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  images: string;
  price: number;
  comparePrice: number | null;
  wholesalePrice: number | null;
  minOrderQty: number;
  isFeatured: boolean;
  specifications: string | null;
  Category: { id: string; name: string; slug?: string } | null;
}

export function CategoryPage({ slug, onNavigate }: CategoryPageProps) {
  const [category, setCategory] = useState<{ id: string; name: string; description: string | null; image: string | null; blocks: string | null } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [enquiryProduct, setEnquiryProduct] = useState<string | null>(null);

  const { blocks: cmsBlocks } = useContentPage(slug);

  useEffect(() => {
    async function load() {
      try {
        const catRes = await fetch(`/api/categories?slug=${slug}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          const cat = (catData.categories || [])[0] || catData.category;
          if (cat) {
            setCategory(cat);
            const prodRes = await fetch(`/api/products?categoryId=${cat.id}`);
            if (prodRes.ok) {
              const prodData = await prodRes.json();
              setProducts(prodData.products || []);
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const openEnquiry = (productName?: string) => {
    setEnquiryProduct(productName || null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Category not found</h2>
        <p className="text-sm text-muted-foreground mb-4">The category you're looking for doesn't exist.</p>
        <Button onClick={() => onNavigate('catalogue')}>Back to catalogue</Button>
      </div>
    );
  }

  const featuredProducts = products.filter((p) => p.isFeatured);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent_60%)]" />
        <div className="relative container mx-auto max-w-5xl px-4 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            {category.image && (
              <div className="mb-6 w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-3">Product category</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">{category.description}</p>
            )}
            <div className="mt-8 flex gap-3 flex-wrap justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10"
                onClick={() => openEnquiry()}
              >
                <Send className="mr-2 h-4 w-4" />
                Enquire about {category.name}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => onNavigate('catalogue')}
              >
                View all products
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* Trust Strip */}
      <section className="bg-muted/40 border-b">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustIcons.map((Icon, i) => (
              <div key={trustLabels[i]} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {trustLabels[i]}
              </div>
            ))}
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{products.length}</span> product{products.length > 1 ? 's' : ''} in this range
            </div>
          </div>
        </div>
      </section>

      {/* CMS Customizable Blocks */}
      {(() => {
        let blocks = cmsBlocks;
        if (category?.blocks) {
          try {
            const parsed = JSON.parse(category.blocks);
            if (Array.isArray(parsed) && parsed.length > 0) blocks = parsed;
          } catch { /* fallback to cmsBlocks */ }
        }
        return blocks && blocks.length > 0 ? (
          <div className="container mx-auto max-w-5xl px-4">
            <PageBlockRenderer blocks={blocks} onNavigate={onNavigate} />
          </div>
        ) : null;
      })()}

      {/* Enquiry Form */}
      {showForm && (
        <section className="bg-muted/40 py-8 px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-background border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-1">
                {enquiryProduct ? `Enquire about ${enquiryProduct}` : `Enquire about ${category.name}`}
              </h3>
              <p className="text-xs text-muted-foreground mb-5">Fill in your details and we'll respond within 24 hours</p>
              <SharedContactForm
                initialEnquiryType="product"
                productContext={enquiryProduct || category.name}
                variant="inline"
              />
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Product range</p>
              <h2 className="text-2xl md:text-3xl font-bold">Our {category.name} range</h2>
              <p className="text-sm text-muted-foreground mt-1">{products.length} product{products.length > 1 ? 's' : ''} available for bulk, private label & distribution</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {displayProducts.map((product) => {
                const images = product.images ? product.images.split(',').filter(Boolean) : [];
                const specs = product.specifications ? parseSpecs(product.specifications) : null;
                return (
                  <div key={product.id} className="group border rounded-xl overflow-hidden bg-background transition-all hover:shadow-lg hover:-translate-y-0.5">
                    <div className="relative h-56 bg-muted overflow-hidden">
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      {product.isFeatured && (
                        <span className="absolute top-3 left-3 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded font-medium shadow">Featured</span>
                      )}
                      {images.length > 1 && (
                        <div className="absolute bottom-3 right-3 flex gap-1">
                          {images.slice(0, 3).map((img, i) => (
                            <div key={i} className="w-8 h-8 rounded border border-white/40 overflow-hidden shadow">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold">{product.name}</h3>
                      </div>
                      {product.Category && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium inline-block mb-2">
                          {product.Category.name}
                        </span>
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {product.description || product.shortDescription || 'Premium quality product manufactured in-house.'}
                      </p>

                      {/* Specifications */}
                      {specs && (
                        <div className="mb-4 bg-muted/30 rounded-lg p-3 space-y-1">
                          {specs.map((spec, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{spec.label}</span>
                              <span className="font-medium">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Additional images */}
                      {images.length > 1 && (
                        <div className="flex gap-2 mb-4 overflow-x-auto">
                          {images.slice(1).map((img, i) => (
                            <div key={i} className="w-16 h-16 rounded-lg border overflow-hidden flex-shrink-0 bg-muted">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => openEnquiry(product.name)}
                      >
                        <Send className="mr-2 h-3.5 w-3.5" />
                        Enquire about {product.name}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Interested in {category.name}?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">Get pricing, samples, packaging details and MOQ information from our team.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
              onClick={() => openEnquiry()}
            >
              <Send className="mr-2 h-4 w-4" />
              Send enquiry
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => onNavigate('contact')}
            >
              Contact sales team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function parseSpecs(specifications: string): Array<{ label: string; value: string }> {
  try {
    const parsed = JSON.parse(specifications);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'object') {
      return Object.entries(parsed).map(([key, val]) => ({ label: key, value: String(val) }));
    }
  } catch {
    // Not JSON, try line-by-line
  }
  return specifications.split('\n').filter(Boolean).map((line) => {
    const sep = line.includes(':') ? ':' : line.includes('-') ? '-' : '|';
    const parts = line.split(sep);
    if (parts.length >= 2) {
      return { label: parts[0].trim(), value: parts.slice(1).join(sep).trim() };
    }
    return { label: line, value: '' };
  });
}
