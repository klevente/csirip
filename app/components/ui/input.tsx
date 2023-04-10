import type { ComponentProps } from "react";
import { forwardRef } from "react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const inputStyles = cva(
  "w-full rounded border-2 px-1 py-2 focus:outline-none transition",
  {
    variants: {
      hasError: {
        true: "border-fuchsia-700 shadow-offset-fuchsia-700 focus:border-fuchsia-400 focus:shadow-offset-fuchsia-400",
        false:
          "border-black shadow-offset-black focus:border-teal-500 focus:shadow-offset-teal-500",
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
);

export interface InputProps
  extends ComponentProps<"input">,
    VariantProps<typeof inputStyles> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", hasError, ...props }, ref) => (
    <input
      className={inputStyles({ hasError })}
      type={type}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = "Input";
