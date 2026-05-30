import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { POST_GRADIENTS, type TailorPost } from "@/lib/mock-data";

export type PostDraft = Pick<TailorPost, "title" | "description" | "customerName" | "imageGradient">;

interface Props {
  open: boolean;
  initial: PostDraft | null;
  mode: "create" | "edit";
  onClose: () => void;
  onSave: (draft: PostDraft) => void;
}

const EMPTY: PostDraft = {
  title: "",
  description: "",
  customerName: "",
  imageGradient: POST_GRADIENTS[0].gradient,
};

export function PostDialog({ open, initial, mode, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<PostDraft>(EMPTY);

  useEffect(() => {
    if (open) setDraft(initial ?? EMPTY);
  }, [open, initial]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.description.trim() || !draft.customerName.trim()) return;
    onSave(draft);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">
            {mode === "create" ? "Add a new post" : "Edit post"}
          </DialogTitle>
          <DialogDescription>
            Showcase a finished commission. Photos land once Cloud is connected — for now pick a colour theme.
          </DialogDescription>
        </DialogHeader>

        <form id="post-form" onSubmit={submit} className="space-y-4 py-2">
          <Field label="Title">
            <Input
              value={draft.title}
              maxLength={80}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Saffron Dunes"
            />
          </Field>
          <Field label="Customer name">
            <Input
              value={draft.customerName}
              maxLength={60}
              onChange={(e) => setDraft({ ...draft, customerName: e.target.value })}
              placeholder="Amira H."
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={draft.description}
              maxLength={500}
              rows={4}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Fabric, fittings, finishing details…"
            />
          </Field>
          <Field label="Colour theme">
            <div className="grid grid-cols-4 gap-2">
              {POST_GRADIENTS.map((g) => {
                const active = draft.imageGradient === g.gradient;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, imageGradient: g.gradient })}
                    className={cn(
                      "h-14 rounded-md border-2 transition-all",
                      active ? "border-accent shadow-[var(--shadow-luxe)] scale-[1.02]" : "border-transparent",
                    )}
                    style={{ background: g.gradient }}
                    aria-label={g.label}
                    title={g.label}
                  />
                );
              })}
            </div>
          </Field>
        </form>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="post-form" className="bg-primary text-primary-foreground">
            {mode === "create" ? "Publish post" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
