import React, { type ReactNode } from "react";
import { cn } from "../utils/cn";

interface CustomButtonInterface {
  disabled?: boolean;
  type?: "submit" | "reset" | "button";
  onclick?: () => void;
  children: ReactNode;
  className?: string;
}

const CustomButton: React.FC<CustomButtonInterface> = ({
  disabled,
  type = "button",
  onclick,
  children,
  className,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onclick}
      className={cn(
        "bg-[var(--color-accent)] btn-accent w-full py-4 text-lg font-bold shadow-xl border rounded-md cursor-pointer",
        "border-[var(--color-border)] text-text-primary",
        "sm:opacity-80 hover:opacity-95 hover:border-[var(--color-border-light)]",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {children}
    </button>
  );
};

export default CustomButton;
