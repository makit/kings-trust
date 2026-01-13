'use client';

import { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  onSubmit: (values: string[]) => void;
  disabled?: boolean;
  description?: string;
}

export default function MultiSelect({ options, onSubmit, disabled, description }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleOption(value: string) {
    const newSelected = new Set(selected);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    setSelected(newSelected);
  }

  function handleSubmit() {
    if (selected.size === 0) {
      alert('Please select at least one option');
      return;
    }
    onSubmit(Array.from(selected));
  }

  return (
    <div className="space-y-3">
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}

      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
            ${selected.has(option.value)
              ? 'border-primary bg-primary/5' 
              : 'border-gray-200 hover:border-primary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="checkbox"
            value={option.value}
            checked={selected.has(option.value)}
            onChange={() => toggleOption(option.value)}
            disabled={disabled}
            className="w-5 h-5 text-primary focus:ring-primary rounded"
          />
          <span className="ml-3 text-gray-900">{option.label}</span>
        </label>
      ))}

      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-gray-500">
          {selected.size} selected
        </span>
        <button
          onClick={handleSubmit}
          disabled={disabled || selected.size === 0}
          className="bg-primary-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
