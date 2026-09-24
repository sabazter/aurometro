import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
