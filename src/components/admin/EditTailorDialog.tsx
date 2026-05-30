import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ManagedTailor } from "@/lib/mock-data";

interface Props {
  tailor: ManagedTailor | null;
  onClose: () => void;
  onSave: (t: ManagedTailor) => void;
}

export function EditTailorDialog({ tailor, onClose, onSave }: Props) {
  const [form, setForm] = useState<ManagedTailor | null>(tailor);

  useEffect(() => setForm(tailor), [tailor]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={!!tailor} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">Edit tailor</DialogTitle>
          <DialogDescription>Update atelier details. Changes save locally for now.</DialogDescription>
        </DialogHeader>
        {form && (
          <>
            <form id="edit-tailor-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2 py-2">
              <Field label="Full name">
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </Field>
              <Field label="Atelier name">
                <Input value={form.atelier} onChange={(e) => setForm({ ...form, atelier: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="City">
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
            </form>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" form="edit-tailor-form" className="bg-primary text-primary-foreground">Save changes</Button>
            </DialogFooter>
          </>
        )}
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
