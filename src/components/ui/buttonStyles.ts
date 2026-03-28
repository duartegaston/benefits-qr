import { cn } from "@/lib/utils";

export const buttonBaseClasses =
  "inline-flex items-center justify-center rounded-lg font-medium transition-[transform,background-color,color,box-shadow,border-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

export const buttonVariantClasses = {
  primary:
    "bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500",
  muted:
    "bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-700 focus-visible:ring-violet-200",
  secondary:
    "border border-gray-200 bg-gray-200 text-gray-800 shadow-sm hover:border-gray-300 hover:bg-gray-300 focus-visible:ring-gray-400",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  logout:
    "border border-red-200/80 bg-red-50/90 text-red-700 shadow-sm hover:border-red-300 hover:bg-red-100 hover:text-red-800 focus-visible:ring-red-300",
  success:
    "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
  light:
    "border border-violet-200/70 bg-violet-50 text-violet-700 shadow-sm hover:border-violet-300 hover:bg-violet-100 focus-visible:ring-violet-200 focus-visible:ring-offset-violet-600",
  subtle:
    "border border-violet-200/70 bg-white/80 text-violet-700 shadow-sm hover:border-violet-300 hover:bg-white hover:text-violet-800 focus-visible:ring-violet-300",
} as const;

export const buttonSizeClasses = {
  sm: "min-h-[36px] px-3 py-2 text-sm",
  md: "min-h-[40px] px-4 py-2.5 text-sm",
  lg: "min-h-[48px] px-6 py-3 text-base",
} as const;

export type ButtonVisualVariant = keyof typeof buttonVariantClasses;
export type ButtonVisualSize = keyof typeof buttonSizeClasses;

export function getButtonClasses(
  variant: ButtonVisualVariant,
  size: ButtonVisualSize,
  className?: string
) {
  return cn(
    buttonBaseClasses,
    buttonVariantClasses[variant],
    buttonSizeClasses[size],
    className
  );
}
