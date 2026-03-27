import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (amount: number, currency: string = 'INR') => {
  const locales: Record<string, string> = {
    'INR': 'en-IN',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB'
  };

  return new Intl.NumberFormat(locales[currency] || 'en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};
