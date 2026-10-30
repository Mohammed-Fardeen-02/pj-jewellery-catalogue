"use client";

import * as React from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  hint?: string;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  searchable = false,
  searchPlaceholder = "Search...",
  disabled = false,
  clearable = false,
  className = "",
  actionButton,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opening
  React.useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.hint && opt.hint.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full min-h-[40px] px-3 py-2 bg-white border rounded text-xs text-left flex items-center justify-between gap-2 transition-all ${
          isOpen
            ? "border-[#B08D57] ring-1 ring-[#B08D57]/30 shadow-sm"
            : "border-[#E8E1D8] hover:border-[#B08D57]"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-stone-50" : "cursor-pointer"}`}
      >
        <div className="flex-1 truncate">
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium text-[#24211E] truncate">
                {selectedOption.label}
              </span>
              {selectedOption.badge}
            </div>
          ) : (
            <span className="text-stone-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 text-stone-400 hover:text-stone-600 rounded transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#B08D57]" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#E8E1D8] rounded-md shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Action button header (e.g. "+ Add Category") */}
          {actionButton && (
            <div className="p-2 border-b border-[#E8E1D8] bg-[#FAF8F4]">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  actionButton.onClick();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B08D57] bg-white border border-[#B08D57]/40 rounded hover:bg-[#B08D57] hover:text-white transition-colors"
              >
                {actionButton.icon}
                <span>{actionButton.label}</span>
              </button>
            </div>
          )}

          {/* Search Box */}
          {searchable && (
            <div className="p-2 border-b border-[#E8E1D8] bg-stone-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[#E8E1D8] rounded focus:outline-none focus:border-[#B08D57] text-[#24211E]"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-stone-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? "bg-[#FAF8F4] text-[#B08D57] font-medium"
                        : "text-[#24211E] hover:bg-stone-50"
                    } ${opt.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge}
                      </div>
                      {opt.hint && (
                        <p className="text-[10px] text-stone-400 truncate mt-0.5">
                          {opt.hint}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#B08D57] flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
