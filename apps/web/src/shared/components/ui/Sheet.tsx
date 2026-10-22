import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right";
  title?: string;
}

export function Sheet({
  isOpen,
  onClose,
  children,
  side = "right",
  title,
}: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Navigation Menu"}
        className={cn(
          "relative z-50 flex h-full w-4/5 max-w-sm flex-col bg-background p-6 shadow-2xl transition-transform duration-300 ease-in-out border-border",
          side === "right"
            ? "ml-auto border-l animate-in slide-in-from-right"
            : "mr-auto border-r animate-in slide-in-from-left",
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            {title || "Menu"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pt-4">{children}</div>
      </div>
    </div>
  );
}
