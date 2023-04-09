import type { ComponentProps } from "react";
import React from "react";

interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
  name: string;
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  ...props
}) => {
  return (
    <div className="flex items-center">
      <input
        className="h-4 w-4 rounded border-black text-white accent-teal-500 hover:accent-teal-400 focus:ring-teal-600"
        id={name}
        name={name}
        type="checkbox"
        {...props}
      />
      <label className="ml-2 text-sm" htmlFor={name}>
        {label}
      </label>
    </div>
  );
};
