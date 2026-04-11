"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
}

export function CustomSelect({ value, onChange, options, placeholder = "Selecione...", required }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Hidden input for form validation */}
      {required && <input type="text" value={value} required className="sr-only" tabIndex={-1} onChange={() => {}} />}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-lg px-4 py-2.5 text-sm text-left transition-all duration-200 cursor-pointer backdrop-blur-sm"
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          border: `1px solid rgba(255,255,255,${open ? 0.2 : 0.1})`,
          color: selected ? "#fff" : "rgba(192,192,192,0.3)",
        }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className="w-4 h-4 text-silver/30 shrink-0 ml-2 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden backdrop-blur-xl shadow-2xl"
          style={{
            background: "rgba(15,15,15,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer"
              style={{
                backgroundColor: option.value === value ? "rgba(255,255,255,0.08)" : "transparent",
                color: option.value === value ? "#fff" : "rgba(192,192,192,0.7)",
              }}
              onMouseEnter={(e) => {
                if (option.value !== value) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (option.value !== value) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
