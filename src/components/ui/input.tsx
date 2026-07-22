import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-9 w-full rounded-md border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-blue-500 dark:border-neutral-700",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
