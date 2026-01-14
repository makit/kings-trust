'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when new question loads
  useEffect(() => {
    setSelected('');
    setIsSubmitting(false);
  }, [options]);

  function handleSubmit() {
    if (!selected) {
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(selected);
    }, 300);
  }

  return (
    <div className="space-y-3 animate-slide-up">
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => !disabled && setSelected(option.value)}
          disabled={disabled}
          className={`
            w-full text-left p-4 rounded-2xl border-2 transition-all duration-200
            transform hover:scale-[1.02] active:scale-95
            ${selected === option.value 
              ? 'border-brand-red bg-brand-red text-white shadow-lg scale-[1.02]' 
              : 'border-gray-200 bg-white text-[#323232] hover:border-brand-red/50 hover:shadow-md'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${selected === option.value 
                ? 'border-white bg-white' 
                : 'border-gray-300'
              }
            `}>
              {selected === option.value && (
                <Check size={16} className="text-brand-red animate-bounce-in" />
              )}
            </div>
            <span className="font-medium flex-1">{option.label}</span>
          </div>
        </button>
      ))}

      <button
        onClick={handleSubmit}
        disabled={disabled || !selected || isSubmitting}
        className={`
          w-full mt-6 py-4 px-6 rounded-2xl font-bold text-lg shadow-lg
          transform transition-all duration-200
          ${selected && !disabled && !isSubmitting
            ? 'bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-xl hover:scale-[1.02] active:scale-95'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </span>
        ) : (
          `Continue ${selected ? '✨' : ''}`
        )}
      </button>
    </div>
  );
}
