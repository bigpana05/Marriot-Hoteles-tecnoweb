export interface Coupon {
  id?: number | string; // Soporta ambos tipos de ID
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  validUntil: string;
  isActive: boolean;
  isPublic: boolean;
  description?: string;
}