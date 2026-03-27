import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-[0_4px_0_0_#1d4ed8] active:shadow-none active:translate-y-[4px]',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 shadow-[0_4px_0_0_#d1d5db] dark:shadow-[0_4px_0_0_#374151] active:shadow-none active:translate-y-[4px]',
    outline: 'border-2 border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-700 dark:hover:bg-gray-800 shadow-[0_4px_0_0_#d1d5db] dark:shadow-[0_4px_0_0_#374151] active:shadow-none active:translate-y-[4px]',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-300 dark:hover:bg-gray-800 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-[0_4px_0_0_#b91c1c] active:shadow-none active:translate-y-[4px]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-2xl',
    icon: 'p-2 rounded-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:duration-75',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};
