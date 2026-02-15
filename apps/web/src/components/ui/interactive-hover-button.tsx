import React from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant?: "default" | "filled";
  icon?: LucideIcon;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", variant = "default", icon: Icon = ArrowRight, className, ...props }, ref) => {
  const isFilled = variant === "filled";

  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-32 cursor-pointer overflow-hidden rounded-full border p-2 text-center font-semibold",
        isFilled
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-border",
        className,
      )}
      {...props}
    >
      <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {text}
      </span>
      <div
        className={cn(
          "absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100",
          isFilled ? "text-primary" : "text-primary-foreground",
        )}
      >
        <span>{text}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div
        className={cn(
          "absolute left-[10%] top-1/2 -translate-y-1/2 h-2 w-2 scale-[1] rounded-full transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:translate-y-0 group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:rounded-lg",
          isFilled ? "bg-background" : "bg-primary",
        )}
      ></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
