import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle }) => {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:-translate-y-1', 
      className
    )}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800/50 flex flex-col gap-1">
          {title && <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
