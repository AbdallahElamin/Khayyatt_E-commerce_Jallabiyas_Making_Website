import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { UserCog, ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PasswordGate } from "@/components/profile/PasswordGate";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/profile")({
  head: () => ({ meta: [{ title: "Profile — Khayyat" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, role } = useApp();
  const [unlocked, setUnlocked] = useState(false);

  if (role === "admin") {
    return (
      <PagePlaceholder
        icon={ShieldAlert}
        eyebrow="Admins"
        title="Profile editing isn't available"
        description="Administrator accounts are managed directly in the database. Head to the dashboard to operate the platform."
      >
        <div className="flex justify-center">
          <Button asChild className="bg-primary text-primary-foreground">
            <Link to="/admin">Open Admin Dashboard</Link>
          </Button>
        </div>
      </PagePlaceholder>
    );
  }

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
          <UserCog className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground capitalize">
            {role} account
          </p>
          <h1 className="font-display text-4xl text-primary">Edit profile</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl text-primary">{user.name}</CardTitle>
          <CardDescription>
            {role === "customer"
              ? "Update your picture, name, password, and location."
              : "Update your picture and display name. Other details are locked."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEditForm onLock={() => setUnlocked(false)} />
        </CardContent>
      </Card>
    </div>
  );
}
