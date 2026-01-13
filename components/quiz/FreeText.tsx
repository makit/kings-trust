'use client';

import { useState, useEffect } from 'react';

interface Props {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minLength?: number;
}

export default function FreeText({ onSubmit, disabled, placeholder, minLength = 10 }: Props) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when new question loads (detected by placeholder change)
  useEffect(() => {
    setText('');
    setIsSubmitting(false);
  }, [placeholder]);

  function handleSubmit() {
    const trimmed = text.trim();
    
    if (trimmed.length < minLength) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(trimmed);
    }, 300);
  }

  const charCount = text.trim().length;
  const isValid = charCount >= minLength;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || 'Type your answer here...'}
          disabled={disabled}
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-2xl focus:border-brand-red focus:outline-none transition-colors resize-none text-[#323232] placeholder:text-[#323232]/40"
        />
        {/* Character count indicator */}
        <div className={`
          absolute bottom-3 right-3 text-xs px-2 py-1 rounded-full font-medium
          ${isValid 
            ? 'bg-secondary-500 text-white' 
            : 'bg-gray-200 text-gray-500'
          }
        `}>
          {charCount}/{minLength}+
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={disabled || !isValid || isSubmitting}
        className={`
          w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg
          transform transition-all duration-200
          ${isValid && !disabled && !isSubmitting
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
          `Continue ${isValid ? '✨' : ''}`
        )}
      </button>
    </div>
  );
}
