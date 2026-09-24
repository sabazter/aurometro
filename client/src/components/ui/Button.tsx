import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'ghost';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'px-4 py-3 min-h-[44px] rounded-xl font-semibold transition-all duration-150 flex items-center justify-center select-none active:scale-95 touch-manipulation cursor-pointer';
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 active:opacity-90',
    danger: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 active:bg-rose-500/30',
    success: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 active:bg-emerald-500/30',
    ghost: 'hover:bg-slate-200 dark:hover:bg-white/10 active:bg-slate-300 dark:active:bg-white/20'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed active:scale-100' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};
