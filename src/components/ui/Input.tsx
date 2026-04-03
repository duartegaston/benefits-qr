"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-text-primary"
          >
            {label}
            {required ? <span className="ml-1 text-danger">*</span> : null}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          data-slot="input"
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full min-w-0 rounded-xl border border-border-default bg-surface px-3 py-2.5 text-base text-text-primary shadow-sm outline-none transition-[border-color,box-shadow,background-color,color] duration-200 placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm file:inline-flex file:border-0 file:bg-transparent file:text-foreground",
            error && "border-danger-border focus-visible:ring-danger-soft",
            className
          )}
          required={required}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
