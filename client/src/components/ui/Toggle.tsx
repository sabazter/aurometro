import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, description, disabled }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col">
        {label && <span className="font-medium text-slate-900 dark:text-slate-100">{label}</span>}
        {description && <span className="text-sm text-slate-500 dark:text-slate-400">{description}</span>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${checked ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
};
