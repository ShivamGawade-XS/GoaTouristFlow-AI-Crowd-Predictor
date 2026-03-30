import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CDS_CONFIG = {
  LOW: { range: [0, 20], color: 'text-primary', bg: 'bg-primary/20', label: 'Low' },
  MODERATE: { range: [21, 50], color: 'text-tertiary', bg: 'bg-tertiary/20', label: 'Moderate' },
  HIGH: { range: [51, 80], color: 'text-error-dim', bg: 'bg-error-dim/20', label: 'High' },
  CRITICAL: { range: [81, 100], color: 'text-error', bg: 'bg-error/20', label: 'Critical' },
};

export function getCDSInfo(score: number) {
  if (score <= 20) return CDS_CONFIG.LOW;
  if (score <= 50) return CDS_CONFIG.MODERATE;
  if (score <= 80) return CDS_CONFIG.HIGH;
  return CDS_CONFIG.CRITICAL;
}
