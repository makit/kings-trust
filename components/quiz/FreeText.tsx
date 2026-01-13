'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minLength?: number;
}

export default function FreeText({ onSubmit, disabled, placeholder, minLength = 10 }: Props) {
  const [text, setText] = useState('');

  function handleSubmit() {
    const trimmed = text.trim();
    
    if (trimmed.length < minLength) {
      alert(`Please provide at least ${minLength} characters`);
      return;
    }
    
    onSubmit(trimmed);
  }

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder || 'Type your answer here...'}
        disabled={disabled}
        rows={6}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
      />
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {text.trim().length} characters
        </span>
        <button
          onClick={handleSubmit}
          disabled={disabled || text.trim().length < minLength}
          className="bg-primary-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
