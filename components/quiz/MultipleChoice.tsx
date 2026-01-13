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

export default function MultipleChoice({ options, onSubmit, disabled }: Props) {
  const [selected, setSelected] = useState<string>('');

  function handleSubmit() {
    if (!selected) {
      alert('Please select an option');
      return;
    }
    onSubmit(selected);
  }

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
            ${selected === option.value 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-200 hover:border-primary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="radio"
            name="quiz-option"
            value={option.value}
            checked={selected === option.value}
            onChange={(e) => setSelected(e.target.value)}
            disabled={disabled}
            className="w-5 h-5 text-primary focus:ring-primary"
          />
          <span className="ml-3 text-gray-900">{option.label}</span>
        </label>
      ))}

      <button
        onClick={handleSubmit}
        disabled={disabled || !selected}
        className="w-full mt-6 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
