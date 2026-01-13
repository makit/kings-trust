'use client';

import { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export default function ScaleQuestion({ options, onSubmit, disabled }: Props) {
  const [selected, setSelected] = useState<string>('');

  function handleSubmit() {
    if (!selected) {
      alert('Please select a rating');
      return;
    }
    onSubmit(selected);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
              ${selected === option.value 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 hover:border-primary/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name="scale-option"
              value={option.value}
              checked={selected === option.value}
              onChange={(e) => setSelected(e.target.value)}
              disabled={disabled}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-gray-900">{option.label}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={disabled || !selected}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
