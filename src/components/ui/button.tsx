import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "~/utils/classnames";

export const buttonVariants = cva(
  "px-10 py-3 font-semibold no-underline transition inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
        semiTransparent: "bg-white/10 hover:bg-white/20",
      },
      roundness: {
        round: "rounded-full",
      },
      defaultVariants: {
        variant: "default",
      },
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  roundness,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, roundness, className }))}
      {...props}
    >
      {children}
    </button>
  );
}
