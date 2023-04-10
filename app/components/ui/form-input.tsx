import type { ComponentProps } from "react";
import React, { forwardRef } from "react";
import type { InputProps } from "./input";
import { Input } from "./input";
import { useField } from "remix-validated-form";

interface FormErrorProps extends ComponentProps<"p"> {
  error?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error }) => {
  return (
    <div className="p-1 text-sm text-fuchsia-700 transition-all">{error}</div>
  );
};

interface Props extends Omit<InputProps, "ref"> {
  label: string;
  name: string;
}

export const FormInput = forwardRef<HTMLInputElement, Props>(
  ({ name, label, placeholder, ...props }, ref) => {
    const errorName = `${name}-error`;
    const { error, getInputProps } = useField(name);
    const hasError = !!error;

    return (
      <label className="relative">
        <div className="text-sm">{label}</div>
        <Input
          {...getInputProps({ id: name, ...props })}
          placeholder={placeholder ?? label}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={errorName}
          hasError={hasError}
        />
        {hasError && <FormError error={error} id={errorName} />}
      </label>
    );
  }
);

FormInput.displayName = "FormInput";
