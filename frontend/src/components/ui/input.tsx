import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full h-11 px-3.5 bg-white border text-sm text-[#24211E] placeholder:text-[#716B64]/60 transition-colors duration-150",
          "focus:outline-none focus:ring-1 focus:ring-[#B08D57] focus:border-[#B08D57]",
          "disabled:opacity-50 disabled:bg-[#FAF8F4] disabled:cursor-not-allowed",
          error ? "border-rose-500 focus:ring-rose-500 focus:border-rose-500" : "border-[#E8E1D8]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
