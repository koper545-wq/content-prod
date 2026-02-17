"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export function TagInput({ label, value, onChange, placeholder, suggestions, className }: TagInputProps) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = input.trim().toLowerCase();
      if (tag && !value.includes(tag)) { onChange([...value, tag]); }
      setInput("");
    }
    if (e.key === "Backspace" && !input && value.length > 0) { onChange(value.slice(0, -1)); }
  }

  function removeTag(tag: string) { onChange(value.filter((t) => t !== tag)); }

  const filteredSuggestions = suggestions?.filter((s) => !value.includes(s) && s.includes(input.toLowerCase()));

  return (
    <div className={cn("w-full", className)}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-1.5 p-2.5 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 min-h-[42px]">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-lg">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-orange-900"><X size={12} /></button>
          </span>
        ))}
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""} className="flex-1 min-w-[100px] text-sm outline-none bg-transparent" />
      </div>
      {input && filteredSuggestions && filteredSuggestions.length > 0 && (
        <div className="mt-1 border border-gray-100 rounded-xl bg-white shadow-sm p-1">
          {filteredSuggestions.slice(0, 5).map((s) => (
            <button key={s} type="button" onClick={() => { onChange([...value, s]); setInput(""); }}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}
