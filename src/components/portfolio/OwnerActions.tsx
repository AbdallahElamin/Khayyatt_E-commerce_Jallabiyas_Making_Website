import { useState } from "react";
import { Plus, Camera, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onAddPost: () => void;
  onEditName: () => void;
  onEditAvatar: () => void;
}

export function OwnerActions({ onAddPost, onEditName, onEditAvatar }: Props) {
  const [open, setOpen] = useState(false);

  const items = [
    { label: "Edit profile picture", icon: Camera, onClick: onEditAvatar },
    { label: "Edit display name",    icon: Type,   onClick: onEditName },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open &&
        items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <span className="rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium text-primary shadow-[var(--shadow-elevated)]">
              {it.label}
            </span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => { setOpen(false); it.onClick(); }}
              className="h-11 w-11 rounded-full bg-background shadow-[var(--shadow-elevated)]"
            >
              <it.icon className="h-4 w-4" />
            </Button>
          </div>
        ))}

      {open && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium text-primary shadow-[var(--shadow-elevated)]">
            Add new post
          </span>
          <Button
            size="icon"
            onClick={() => { setOpen(false); onAddPost(); }}
            className="h-12 w-12 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-[var(--shadow-luxe)]"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      )}

      <Button
        size="icon"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "h-14 w-14 rounded-full shadow-[var(--shadow-luxe)] transition-transform",
          open ? "bg-primary text-primary-foreground rotate-45" : "bg-primary text-primary-foreground",
        )}
        aria-label={open ? "Close actions" : "Open profile actions"}
      >
        {open ? <X className="h-5 w-5 -rotate-45" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}
