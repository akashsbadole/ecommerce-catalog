
export function generateProductSchema(product: any, siteUrl: string) {
  const images = (() => {
    try {
      const arr = JSON.parse(product.images || '[]');
      return Array.isArray(arr) ? arr.map(img => img.startsWith('http') ? img : `${siteUrl}${img}`) : [];
    } catch {
      return [];
    }
  })();

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    sku: product.sku,
    image: images,
    brand: {
      '@type': 'Brand',
      name: 'Purva Bites'
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock'
    }
  };

  // Add custom schema overrides if present
  if (product.customSchema && product.customSchema !== '{}') {
    try {
      const overrides = JSON.parse(product.customSchema);
      return { ...schema, ...overrides };
    } catch (e) {
      console.error('Failed to parse custom schema', e);
    }
  }

  return schema;
}

export function generateArticleSchema(post: any, siteUrl: string) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage.startsWith('http') ? post.coverImage : `${siteUrl}${post.coverImage}`,
    author: {
      '@type': 'Organization',
      name: 'Purva Bites'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Purva Bites',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    datePublished: post.publishedAt || post.createdAt
  };

  if (post.customSchema && post.customSchema !== '{}') {
    try {
      const overrides = JSON.parse(post.customSchema);
      return { ...schema, ...overrides };
    } catch (e) {}
  }

  return schema;
}
