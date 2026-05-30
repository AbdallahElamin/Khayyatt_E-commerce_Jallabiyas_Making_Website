import { useEffect, useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  open: boolean;
  currentUrl: string | null;
  initials: string;
  fallbackGradient: string;
  onClose: () => void;
  onSave: (url: string | null) => void;
}

export function EditAvatarDialog({
  open, currentUrl, initials, fallbackGradient, onClose, onSave,
}: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setPreview(currentUrl);
  }, [open, currentUrl]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary flex items-center gap-2">
            <Camera className="h-5 w-5" /> Update profile picture
          </DialogTitle>
          <DialogDescription>JPG or PNG. Stored locally for now.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-32 w-32 ring-2 ring-accent/40">
            {preview && <AvatarImage src={preview} alt="Preview" />}
            <AvatarFallback
              className="text-3xl font-display text-primary-foreground"
              style={{ background: fallbackGradient }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="gap-1.5">
              <Upload className="h-4 w-4" /> Choose image
            </Button>
            {preview && (
              <Button type="button" variant="ghost" onClick={() => setPreview(null)} className="text-muted-foreground">
                Remove
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            className="bg-primary text-primary-foreground"
            onClick={() => { onSave(preview); onClose(); }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
