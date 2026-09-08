import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-outline" | "success" | "warning-outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  "danger-outline": "bg-white text-red-600 border border-red-200 hover:bg-red-50 shadow-sm",
  success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
  "warning-outline": "bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 shadow-sm",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  children?: ReactNode;
}

export function Button({ variant = "primary", size = "md", href, className, children, ...rest }: Props) {
  const cls = cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
    variants[variant],
    sizes[size],
    className,
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} {...rest}>{children}</button>;
}

export function IconButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
