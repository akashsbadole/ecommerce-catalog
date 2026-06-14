export interface GstBreakdown {
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export const GST_RATES = [
  { label: '0% (Exempted)', rate: 0, hsnSection: 'Chapter 1-98' },
  { label: '5% (Essential Items)', rate: 5, hsnSection: 'Chapter 1-98' },
  { label: '12% (Standard Rate)', rate: 12, hsnSection: 'Chapter 1-98' },
  { label: '18% (Standard Rate)', rate: 18, hsnSection: 'Chapter 1-98' },
  { label: '28% (Luxury Items)', rate: 28, hsnSection: 'Chapter 1-98' },
];

export function calculateGST(
  amount: number,
  rate: number,
  type: 'intra' | 'inter' = 'intra'
): GstBreakdown {
  const total = (amount * rate) / 100;

  if (type === 'intra') {
    return {
      cgst: total / 2,
      sgst: total / 2,
      igst: 0,
      total,
    };
  }

  return {
    cgst: 0,
    sgst: 0,
    igst: total,
    total,
  };
}

export function validateGSTIN(gstin: string): boolean {
  if (!gstin || gstin.length !== 15) return false;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
}
