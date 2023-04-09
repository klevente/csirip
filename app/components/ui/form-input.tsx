import type { ComponentProps } from "react";
import React, { forwardRef } from "react";
import type { InputProps } from "./input";
import { Input } from "./input";

interface FormErrorProps extends ComponentProps<"p"> {
  error: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error }) => (
  <p className="text-sm text-fuchsia-700">{error}</p>
);

interface Props extends Omit<InputProps, "ref"> {
  label: string;
  name: string;
  error?: string | null;
}

export const FormInput = forwardRef<HTMLInputElement, Props>(
  ({ name, label, error, ...props }, ref) => {
    const errorName = `${name}-error`;
    const hasError = !!error;

    return (
      <label>
        <div className="text-sm">{label}</div>
        <Input
          id={name}
          name={name}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={errorName}
          hasError={hasError}
          {...props}
        />
        {error && <FormError error={error} id={errorName} />}
      </label>
    );
  }
);

FormInput.displayName = "FormInput";
