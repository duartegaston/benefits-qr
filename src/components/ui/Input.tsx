import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-border-default bg-surface px-3 py-2 text-base text-text-primary sm:text-sm",
            "placeholder:text-text-muted",
            "focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-soft",
            "transition-[border-color,box-shadow,background-color,color] duration-200",
            error && "border-danger-border focus-visible:ring-danger-soft",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
