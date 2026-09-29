import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium tracking-wide transition-[color,background-color,border-color,box-shadow,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_12px_30px_-12px_rgba(10,10,11,0.55)]",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        inverse: "bg-inverse-accent text-inverse hover:bg-inverse-accent/90 hover:shadow-[0_12px_30px_-12px_rgba(92,184,240,0.6)]",
        "inverse-outline":
          "border border-inverse-foreground/40 text-inverse-foreground hover:border-inverse-foreground hover:bg-inverse-foreground/10",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-transparent hover:border-foreground hover:bg-foreground hover:text-background",
        ghost: "bg-transparent hover:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-7 text-[0.9375rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
