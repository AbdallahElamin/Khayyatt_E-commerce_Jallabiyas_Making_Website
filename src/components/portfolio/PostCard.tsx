import { Pencil, Trash2, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TailorPost } from "@/lib/mock-data";

interface Props {
  post: TailorPost;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const fmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return fmt.format(new Date(iso));
}

export function PostCard({ post, canEdit, onEdit, onDelete }: Props) {
  return (
    <div className="relative pl-8 sm:pl-12">
      {/* Timeline dot */}
      <span className="absolute left-1.5 top-6 h-3 w-3 rounded-full bg-accent ring-4 ring-background sm:left-3.5" />

      <Card className="overflow-hidden border-border transition hover:border-accent/60">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
              <User className="h-3.5 w-3.5" />
            </span>
            <div className="leading-tight">
              <p className="font-medium">{post.customerName}</p>
              <p className="text-xs text-muted-foreground">{relative(post.createdAt)}</p>
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={onEdit} className="h-8 gap-1">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete} className="h-8 gap-1 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          )}
        </div>

        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full" style={{ background: post.imageGradient }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        </div>

        <div className="p-5">
          <h3 className="font-display text-2xl text-primary">{post.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{post.description}</p>
        </div>
      </Card>
    </div>
  );
}
