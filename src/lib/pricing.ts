export function formatPrice(price: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

const DEFAULT_TIER_DISCOUNTS: Record<string, number> = {
  bronze: 0,
  silver: 0.05,
  gold: 0.1,
  platinum: 0.15,
};

const FALLBACK_DISCOUNT = 0.15;

export function calculateTieredPrice(
  basePrice: number,
  tier: string,
  settings?: Record<string, string>
): number {
  if (tier === 'standard') return basePrice;

  if (!settings) {
    const defaultDiscount = DEFAULT_TIER_DISCOUNTS[tier] ?? FALLBACK_DISCOUNT;
    return basePrice * (1 - defaultDiscount);
  }

  const discountStr = settings[`b2b_discount_${tier}`];
  if (discountStr === undefined || discountStr === null) {
    const defaultDiscount = DEFAULT_TIER_DISCOUNTS[tier] ?? FALLBACK_DISCOUNT;
    return basePrice * (1 - defaultDiscount);
  }

  const discount = parseFloat(discountStr);
  if (isNaN(discount)) {
    return basePrice * (1 - FALLBACK_DISCOUNT);
  }

  return basePrice * (1 - discount);
}
