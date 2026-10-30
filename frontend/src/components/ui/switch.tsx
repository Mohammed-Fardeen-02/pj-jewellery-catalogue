"use client";

import * as React from "react";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  id,
}) => {
  const switchId = id || React.useId();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={switchId}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#B08D57] ${
          disabled ? "opacity-40 cursor-not-allowed" : ""
        } ${checked ? "bg-[#B08D57]" : "bg-neutral-300"}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>

      {(label || description) && (
        <label
          htmlFor={switchId}
          className={`text-xs select-none ${
            disabled ? "text-neutral-400 cursor-not-allowed" : "cursor-pointer text-[#24211E]"
          }`}
        >
          {label && <span className="font-medium block">{label}</span>}
          {description && <span className="text-[11px] text-[#716B64] block">{description}</span>}
        </label>
      )}
    </div>
  );
};
