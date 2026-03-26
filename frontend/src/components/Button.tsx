import React, { type ReactNode } from "react";

interface CustomButtonInterface {
  disabled?: boolean;
  type?: "submit" | "reset" | "button" | undefined;
  onclick?: () => void;
  children: ReactNode;
  className?: string;
}
const CustomButton: React.FC<CustomButtonInterface> = ({
  disabled,
  type = undefined,
  onclick,
  children,
  className,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn-accent w-full py-4 text-lg font-bold shadow-xl border border-[var(--color-border)] hover:border-[var(--color-border-light)] opacity-80 hover:opacity-95  text-[var(--color-text-light)] rounded-md ${className}`}
      onClick={onclick}
    >
      {children}
    </button>
  );
};

export default CustomButton;
