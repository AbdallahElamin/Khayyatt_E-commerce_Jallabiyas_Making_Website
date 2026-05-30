import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Ban, CalendarIcon } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { ManagedTailor } from "@/lib/mock-data";

interface Props {
  tailor: ManagedTailor | null;
  onClose: () => void;
  onBan: (id: string, bannedUntil: string) => void;
}

type Preset = "24h" | "7d" | "30d" | "90d" | "permanent" | "custom";

export function BanTailorDialog({ tailor, onClose, onBan }: Props) {
  const [preset, setPreset] = useState<Preset>("7d");
  const [custom, setCustom] = useState<Date | undefined>();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (tailor) {
      setPreset("7d");
      setCustom(undefined);
      setReason("");
    }
  }, [tailor]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!tailor) return;
    const until = computeUntil(preset, custom);
    if (!until) return;
    onBan(tailor.id, until);
    onClose();
  };

  return (
    <Dialog open={!!tailor} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Ban tailor
          </DialogTitle>
          <DialogDescription>
            {tailor ? `${tailor.atelier} — ${tailor.fullName}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form id="ban-form" onSubmit={submit} className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Duration</Label>
            <RadioGroup value={preset} onValueChange={(v) => setPreset(v as Preset)} className="grid grid-cols-2 gap-2">
              <Option value="24h" label="24 hours" current={preset} />
              <Option value="7d" label="7 days" current={preset} />
              <Option value="30d" label="30 days" current={preset} />
              <Option value="90d" label="90 days" current={preset} />
              <Option value="permanent" label="Permanent" current={preset} />
              <Option value="custom" label="Custom date" current={preset} />
            </RadioGroup>
          </div>

          {preset === "custom" && (
            <div className="space-y-1.5">
              <Label>End date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !custom && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {custom ? format(custom, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={custom}
                    onSelect={setCustom}
                    disabled={(d) => d <= new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Reason (internal)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this tailor being banned?"
              rows={3}
              maxLength={500}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            form="ban-form"
            variant="destructive"
            disabled={preset === "custom" && !custom}
          >
            Confirm ban
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Option({ value, label, current }: { value: Preset; label: string; current: Preset }) {
  const active = current === value;
  return (
    <label
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors",
        active ? "border-primary bg-primary/5" : "border-input hover:bg-muted/40",
      )}
    >
      <RadioGroupItem value={value} />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function computeUntil(preset: Preset, custom?: Date): string | null {
  if (preset === "permanent") return "permanent";
  if (preset === "custom") return custom ? custom.toISOString() : null;
  const now = new Date();
  const days = preset === "24h" ? 1 : preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}
