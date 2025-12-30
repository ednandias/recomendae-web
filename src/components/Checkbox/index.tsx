import type { InputHTMLAttributes } from "react";
import "./styles.css";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, ...rest }: CheckboxProps) {
  return <input aria-label={label} type="checkbox" {...rest} />;
}
