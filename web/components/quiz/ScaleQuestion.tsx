'use client';

import { useState, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

const emojis = ['😕', '🙁', '😐', '🙂', '😊', '🤩'];

export default function ScaleQuestion({ options, onSubmit, disabled }: Props) {
  const [selected, setSelected] = useState<string>('');
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when new question loads
  useEffect(() => {
    setSelected('');
    setHoveredIndex(-1);
    setIsSubmitting(false);
  }, [options]);

  function handleSubmit() {
    if (!selected) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(selected);
    }, 300);
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Emoji Scale Display */}
      <div className="flex justify-center items-center gap-1 py-4">
        {options.map((option, index) => {
          const isSelected = selected === option.value;
          const isHovered = hoveredIndex === index;
          const emoji = emojis[index] || '😊';
          
          return (
            <button
              key={option.value}
              onClick={() => !disabled && setSelected(option.value)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(-1)}
              disabled={disabled}
              className={`
                w-14 h-14 rounded-2xl flex items-center justify-center
                text-3xl transition-all duration-200 transform
                ${isSelected 
                  ? 'bg-brand-red scale-125 shadow-lg' 
                  : isHovered
                    ? 'bg-brand-red/20 scale-110'
                    : 'bg-gray-100 hover:bg-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className={isSelected ? 'animate-bounce-in' : ''}>
                {emoji}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between text-sm text-[#323232]/70 px-2">
        <span>{options[0]?.label}</span>
        <span>{options[options.length - 1]?.label}</span>
      </div>

      {/* Selected Value Display */}
      {selected && (
        <div className="text-center animate-bounce-in">
          <p className="text-sm font-medium text-brand-red">
            {options.find(o => o.value === selected)?.label}
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={disabled || !selected || isSubmitting}
        className={`
          w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg
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
