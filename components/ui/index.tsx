import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

function join(...values: Array<string | undefined>) { return values.filter(Boolean).join(" "); }

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={join("soft-shadow rounded-2xl border border-surface-container bg-surface-container-lowest p-4", className)} {...props} />;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean; variant?: "primary" | "secondary" | "ghost" };
export function Button({ className, fullWidth, variant = "primary", type = "button", ...props }: ButtonProps) {
  const styles = {
    primary: "bg-linear-to-r from-primary to-[#0a6dbd] text-on-primary shadow-[0_6px_18px_rgba(7,95,171,0.25)] hover:brightness-105",
    secondary: "border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container-low",
    ghost: "text-primary hover:bg-primary/10",
  };
  return <button type={type} className={join("pressable inline-flex min-h-12 items-center justify-center rounded-2xl px-5 text-sm font-bold transition", styles[variant], fullWidth ? "w-full" : undefined, className)} {...props} />;
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={join("min-h-12 w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 text-sm text-on-surface outline-none transition placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20", className)} {...props} />;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "primary" | "neutral" }) {
  const styles = { success: "bg-secondary-container text-secondary", primary: "bg-primary/10 text-primary", neutral: "bg-surface-container-high text-on-surface-variant" };
  return <span className={join("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", styles[tone])}>{children}</span>;
}
