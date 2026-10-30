import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "brand";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "default",
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    destructive: "bg-rose-50 text-rose-700 border-rose-200",
    outline: "bg-transparent text-slate-600 border-slate-300",
  };

  const dotColors = {
    default: "bg-slate-400",
    brand: "bg-brand-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    destructive: "bg-rose-500",
    outline: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />}
      {children}
    </span>
  );
};
