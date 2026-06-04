export type UserTier = 'standard' | 'silver' | 'gold' | 'platinum';

export const TIER_DISCOUNTS: Record<UserTier, number> = {
  standard: 0,
  silver: 0.05, // 5% off
  gold: 0.10,   // 10% off
  platinum: 0.15 // 15% off
};

export function calculateTieredPrice(basePrice: number, tier: string | null | undefined): number {
  const userTier = (tier?.toLowerCase() || 'standard') as UserTier;
  const discount = TIER_DISCOUNTS[userTier] || 0;
  return basePrice * (1 - discount);
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}
