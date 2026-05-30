import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Camera, Lock as LockIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocationPicker, type LocationValue } from "@/components/auth/LocationPicker";
import { useApp } from "@/context/AppContext";

interface Props {
  onLock: () => void;
}

export function ProfileEditForm({ onLock }: Props) {
  const { user, role } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(user.location ?? null);

  const canEditPassword = role === "customer";
  const canEditLocation = role === "customer";

  const pickAvatar = () => fileRef.current?.click();
  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setAvatar(URL.createObjectURL(f));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canEditPassword && password && password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (canEditPassword && password && password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    toast.success("Saved locally — will persist once Cloud is connected.");
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <Avatar className="h-20 w-20 ring-2 ring-accent/40">
          {avatar && <AvatarImage src={avatar} alt={user.name} />}
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xl font-medium">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <Button type="button" variant="outline" onClick={pickAvatar} className="gap-1.5">
            <Camera className="h-4 w-4" />
            Change picture
          </Button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatar} />
          <p className="mt-2 text-xs text-muted-foreground">JPG or PNG, up to 4MB.</p>
        </div>
      </div>

      {/* Names */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel label="First name">
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </FieldLabel>
        <FieldLabel label="Last name">
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </FieldLabel>
      </div>

      {/* Locked: email + username, always */}
      <div className="grid gap-4 sm:grid-cols-2">
        <LockedField label="Email" value={user.email} />
        <LockedField label="Username" value={user.username ?? ""} />
      </div>

      {role === "tailor" && (
        <LockedField label="Market name" value={user.marketName ?? ""} />
      )}

      {/* Password */}
      {canEditPassword ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="New password (optional)">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </FieldLabel>
          <FieldLabel label="Confirm new password">
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </FieldLabel>
        </div>
      ) : (
        <LockedField label="Password" value="••••••••" hint="Contact an administrator to reset your password." />
      )}

      {/* Location */}
      {canEditLocation ? (
        <FieldLabel label="Location">
          <LocationPicker value={location} onChange={setLocation} />
        </FieldLabel>
      ) : (
        <LockedField
          label="Location"
          value={user.location?.address ?? "—"}
          hint="Tailor locations are managed by the Khayyat team."
        />
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" size="lg" className="bg-primary text-primary-foreground">
          <Save className="mr-2 h-4 w-4" /> Save changes
        </Button>
        <Button type="button" variant="ghost" onClick={onLock} className="text-muted-foreground">
          <LockIcon className="mr-2 h-4 w-4" /> Lock again
        </Button>
      </div>
    </form>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function LockedField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-muted-foreground">
        {label}
        <LockIcon className="h-3 w-3" />
      </Label>
      <Input value={value} disabled readOnly className="bg-muted/50" />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
