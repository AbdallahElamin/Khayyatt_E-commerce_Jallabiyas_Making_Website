import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ornament } from "@/components/ui/ornament";
import { useApp } from "@/context/AppContext";
import {
  getTailorById, getPostsByTailor, POST_GRADIENTS, type TailorPost,
} from "@/lib/mock-data";
import { ProfileHeader } from "@/components/portfolio/ProfileHeader";
import { PostCard } from "@/components/portfolio/PostCard";
import { PostDialog, type PostDraft } from "@/components/portfolio/PostDialog";
import { EditNameDialog } from "@/components/portfolio/EditNameDialog";
import { EditAvatarDialog } from "@/components/portfolio/EditAvatarDialog";
import { OwnerActions } from "@/components/portfolio/OwnerActions";

export const Route = createFileRoute("/_layout/portfolio/$tailorId")({
  loader: ({ params }) => {
    const tailor = getTailorById(params.tailorId);
    if (!tailor) throw notFound();
    return { tailor };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.tailor;
    if (!t) return { meta: [{ title: "Tailor — Khayyat" }] };
    const title = `${t.atelier} — ${t.tailorName} · Khayyat`;
    const desc = `${t.specialty} from ${t.city}, ${t.country}. ${t.years} years of craft, rated ${t.rating.toFixed(1)} by ${t.reviewCount} customers.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: NotFoundProfile,
  errorComponent: ({ error }) => (
    <div className="container mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-destructive">{error.message}</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/portfolio">Back to archive</Link></Button>
    </div>
  ),
  component: TailorProfilePage,
});

function NotFoundProfile() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl text-primary">Atelier not found</h1>
      <p className="mt-2 text-muted-foreground">This tailor may have left the platform.</p>
      <Button asChild className="mt-6 bg-primary text-primary-foreground">
        <Link to="/portfolio">Browse the archive</Link>
      </Button>
    </div>
  );
}

function TailorProfilePage() {
  const { tailor } = Route.useLoaderData();
  const { role, user } = useApp();

  // Owner = the tailor user mapped to this tailorId, OR an admin (full edit rights).
  const canEdit = role === "admin" || (role === "tailor" && user.tailorId === tailor.id);

  // Local editable state (mock — would persist once Cloud is wired).
  const [displayName, setDisplayName] = useState(tailor.tailorName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [posts, setPosts] = useState<TailorPost[]>(() => getPostsByTailor(tailor.id));

  const [postDialog, setPostDialog] = useState<{ open: boolean; editingId: string | null; draft: PostDraft | null }>(
    { open: false, editingId: null, draft: null },
  );
  const [nameDialog, setNameDialog] = useState(false);
  const [avatarDialog, setAvatarDialog] = useState(false);

  const orderedPosts = useMemo(
    () => [...posts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [posts],
  );

  const onSavePost = (draft: PostDraft) => {
    if (postDialog.editingId) {
      setPosts((list) => list.map((p) => (p.id === postDialog.editingId ? { ...p, ...draft } : p)));
      toast.success("Post updated.");
    } else {
      const newPost: TailorPost = {
        id: crypto.randomUUID(),
        tailorId: tailor.id,
        createdAt: new Date().toISOString(),
        ...draft,
      };
      setPosts((list) => [newPost, ...list]);
      toast.success("Post published locally — will persist once Cloud is connected.");
    }
  };

  const onDeletePost = (id: string) => {
    setPosts((list) => list.filter((p) => p.id !== id));
    toast.success("Post removed.");
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2">
          <Link to="/portfolio"><ArrowLeft className="mr-1 h-4 w-4" /> Back to archive</Link>
        </Button>
      </div>

      <ProfileHeader tailor={tailor} displayName={displayName} avatarUrl={avatarUrl} />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Bio */}
        <Card className="p-7 border-accent/30">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> About the atelier
          </div>
          <Ornament className="mt-3 h-3 w-32 text-accent" />
          <p className="mt-4 text-base leading-relaxed text-foreground/85">{tailor.bio}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-accent/40">{tailor.specialty}</Badge>
            <Badge variant="outline" className="border-accent/40">{tailor.city}</Badge>
            <Badge variant="outline" className="border-accent/40">{tailor.years} years</Badge>
          </div>
        </Card>

        {/* Timeline */}
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl text-primary">Recent commissions</h2>
              <p className="text-sm text-muted-foreground">
                {orderedPosts.length} {orderedPosts.length === 1 ? "post" : "posts"}
              </p>
            </div>
          </div>

          {orderedPosts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <p className="font-display text-2xl text-primary">No posts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {canEdit ? "Use the action button to publish the first post." : "This atelier hasn't published any commissions yet."}
              </p>
            </div>
          ) : (
            <div className="relative space-y-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-px before:bg-border sm:before:left-4">
              {orderedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  canEdit={canEdit}
                  onEdit={() => setPostDialog({
                    open: true,
                    editingId: post.id,
                    draft: {
                      title: post.title,
                      description: post.description,
                      customerName: post.customerName,
                      imageGradient: post.imageGradient,
                    },
                  })}
                  onDelete={() => onDeletePost(post.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {canEdit && (
        <>
          <OwnerActions
            onAddPost={() => setPostDialog({
              open: true,
              editingId: null,
              draft: { title: "", description: "", customerName: "", imageGradient: POST_GRADIENTS[0].gradient },
            })}
            onEditName={() => setNameDialog(true)}
            onEditAvatar={() => setAvatarDialog(true)}
          />
          <PostDialog
            open={postDialog.open}
            initial={postDialog.draft}
            mode={postDialog.editingId ? "edit" : "create"}
            onClose={() => setPostDialog({ open: false, editingId: null, draft: null })}
            onSave={onSavePost}
          />
          <EditNameDialog
            open={nameDialog}
            initial={displayName}
            onClose={() => setNameDialog(false)}
            onSave={(n) => { setDisplayName(n); toast.success("Display name updated."); }}
          />
          <EditAvatarDialog
            open={avatarDialog}
            currentUrl={avatarUrl}
            initials={tailor.initials}
            fallbackGradient={tailor.avatarGradient}
            onClose={() => setAvatarDialog(false)}
            onSave={(url) => { setAvatarUrl(url); toast.success("Profile picture updated."); }}
          />
        </>
      )}
    </div>
  );
}
