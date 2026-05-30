import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  initial: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function EditNameDialog({ open, initial, onClose, onSave }: Props) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    if (open) setValue(initial);
  }, [open, initial]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (v.length < 2) return;
    onSave(v);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">Edit display name</DialogTitle>
          <DialogDescription>The name customers see on your profile.</DialogDescription>
        </DialogHeader>
        <form id="name-form" onSubmit={submit} className="space-y-2 py-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            value={value}
            maxLength={60}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        </form>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="name-form" className="bg-primary text-primary-foreground">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
