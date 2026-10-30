import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer tracking-wider text-xs uppercase select-none";

    const variants = {
      primary:
        "bg-[#24211E] text-white hover:bg-[#B08D57] active:bg-[#9A7947] border border-[#24211E] hover:border-[#B08D57]",
      secondary:
        "bg-[#B08D57] text-white hover:bg-[#9A7947] active:bg-[#85673B] border border-[#B08D57]",
      outline:
        "border border-[#E8E1D8] text-[#24211E] bg-transparent hover:border-[#B08D57] hover:text-[#B08D57] active:bg-[#FAF8F4]",
      ghost:
        "text-[#716B64] hover:text-[#24211E] hover:bg-[#F6F3EE] active:bg-[#ECE5DC]",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-rose-600",
    };

    const sizes = {
      sm: "h-8 px-3 text-[11px] gap-1.5",
      md: "h-10 px-5 text-xs gap-2",
      lg: "h-12 px-7 text-xs gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-3.5 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
