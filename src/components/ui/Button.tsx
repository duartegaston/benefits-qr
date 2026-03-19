"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
      primary:
        "bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500",
      secondary:
        "bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-400",
      ghost:
        "bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400",
      danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm min-h-[36px]",
      md: "px-4 py-2.5 text-sm min-h-[40px]",
      lg: "px-6 py-3 text-base min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              aria-hidden="true"
              className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Cargando...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
