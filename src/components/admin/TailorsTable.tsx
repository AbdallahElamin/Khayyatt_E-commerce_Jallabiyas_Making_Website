import { format } from "date-fns";
import { Pencil, Ban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ManagedTailor } from "@/lib/mock-data";

interface Props {
  tailors: ManagedTailor[];
  onEdit: (t: ManagedTailor) => void;
  onBan: (t: ManagedTailor) => void;
  onUnban: (id: string) => void;
}

export function TailorsTable({ tailors, onEdit, onBan, onUnban }: Props) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Atelier</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tailors.map((t) => {
            const banned = isBanned(t.bannedUntil);
            return (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.atelier}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{t.fullName}</span>
                    <span className="text-xs text-muted-foreground">{t.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{t.city}</TableCell>
                <TableCell>
                  {banned ? (
                    <Badge variant="destructive">
                      {t.bannedUntil === "permanent"
                        ? "Permanently banned"
                        : `Banned until ${format(new Date(t.bannedUntil!), "MMM d, yyyy")}`}
                    </Badge>
                  ) : (
                    <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(t)} className="gap-1">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    {banned ? (
                      <Button size="sm" variant="ghost" onClick={() => onUnban(t.id)} className="gap-1 text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" /> Unban
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => onBan(t)} className="gap-1 text-destructive hover:text-destructive">
                        <Ban className="h-3.5 w-3.5" /> Ban
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {tailors.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                No tailors yet — onboard the first atelier.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function isBanned(until: string | null) {
  if (!until) return false;
  if (until === "permanent") return true;
  return new Date(until).getTime() > Date.now();
}
