import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import React from "react";
import { useFormContext, useIsSubmitting } from "remix-validated-form";

const buttonStyles = cva(
  "flex items-center justify-center shadow-offset-black active:shadow-inset-black rounded border-2 border-solid border-black p-2 disabled:opacity-60 disabled:pointer-events-none",
  {
    variants: {
      intent: {
        primary: "bg-teal-500 text-white hover:bg-teal-400 active:bg-teal-600",
        secondary: "hover:bg-gray-100 active:bg-gray-200",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      intent: "primary",
    },
  }
);

export interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonStyles> {}

export const Button: React.FC<ButtonProps> = ({
  intent,
  fullWidth,
  ...props
}) => <button className={buttonStyles({ intent, fullWidth })} {...props} />;

export interface SubmitButtonProps extends ButtonProps {}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  ...props
}) => {
  const isSubmitting = useIsSubmitting();
  const { isValid } = useFormContext();
  const disabled = isSubmitting || !isValid;
  return (
    <Button type="submit" disabled={disabled} {...props}>
      {isSubmitting && (
        <svg
          className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </Button>
  );
};
