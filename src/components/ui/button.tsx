import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "~/utils/classnames";

export const buttonVariants = cva(
  "font-semibold no-underline transition inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-800 text-neutral-200 hover:bg-neutral-700/70 rounded-md px-4 py-2",
        semiTransparentPill:
          "rounded-full bg-white/10 hover:bg-white/20 px-10 py-3",
        ghost: "hover:bg-neutral-700/40 rounded-md py-3 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
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
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, className }))} {...props}>
      {children}
    </button>
  );
}
