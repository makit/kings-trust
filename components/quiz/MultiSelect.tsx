'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when new question loads
  useEffect(() => {
    setSelected(new Set());
    setIsSubmitting(false);
  }, [options]);

  function toggleOption(value: string) {
    if (disabled) return;
    const newSelected = new Set(selected);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    setSelected(newSelected);
  }

  function handleSubmit() {
    if (selected.size === 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(Array.from(selected));
    }, 300);
  }

  return (
    <div className="space-y-3 animate-slide-up">
      {description && (
        <p className="text-sm text-[#323232]/70 mb-4 p-3 bg-secondary-500/10 rounded-2xl border-2 border-secondary-500/20">
          💡 {description}
        </p>
      )}

      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={option.value}
            onClick={() => toggleOption(option.value)}
            disabled={disabled}
            className={`
              w-full text-left p-4 rounded-2xl border-2 transition-all duration-200
              transform hover:scale-[1.02] active:scale-95
              ${selected.has(option.value)
                ? 'border-brand-red bg-brand-red text-white shadow-lg' 
                : 'border-gray-200 bg-white text-[#323232] hover:border-brand-red/50 hover:shadow-md'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                ${selected.has(option.value)
                  ? 'border-white bg-white' 
                  : 'border-gray-300'
                }
              `}>
                {selected.has(option.value) && (
                  <Check size={16} className="text-brand-red animate-bounce-in" />
                )}
              </div>
              <span className="font-medium flex-1">{option.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className={`
          text-sm font-medium px-3 py-1 rounded-full transition-all
          ${selected.size > 0 
            ? 'bg-secondary-500 text-white' 
            : 'bg-gray-200 text-gray-400'
          }
        `}>
          {selected.size} selected ✓
        </div>
        <button
          onClick={handleSubmit}
          disabled={disabled || selected.size === 0 || isSubmitting}
          className={`
            py-4 px-8 rounded-2xl font-bold text-lg shadow-lg
            transform transition-all duration-200
            ${selected.size > 0 && !disabled && !isSubmitting
              ? 'bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-xl hover:scale-[1.02] active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            `Continue ${selected.size > 0 ? '✨' : ''}`
          )}
        </button>
      </div>
    </div>
  );
}
