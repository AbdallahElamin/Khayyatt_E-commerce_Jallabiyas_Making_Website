import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, AlertTriangle, Users, UserCheck, Ban, Package } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MANAGED_TAILORS_SEED, PLATFORM_STATS, type ManagedTailor } from "@/lib/mock-data";
import { TailorsTable } from "@/components/admin/TailorsTable";
import { AddTailorDialog } from "@/components/admin/AddTailorDialog";
import { EditTailorDialog } from "@/components/admin/EditTailorDialog";
import { BanTailorDialog } from "@/components/admin/BanTailorDialog";

export const Route = createFileRoute("/_layout/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Khayyat" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { role } = useApp();
  const [tailors, setTailors] = useState<ManagedTailor[]>(MANAGED_TAILORS_SEED);
  const [editing, setEditing] = useState<ManagedTailor | null>(null);
  const [banning, setBanning] = useState<ManagedTailor | null>(null);

  const stats = useMemo(() => {
    const active = tailors.filter((t) => !isBanned(t.bannedUntil)).length;
    const banned = tailors.length - active;
    return {
      customers: PLATFORM_STATS.customers,
      active,
      banned,
      orders: PLATFORM_STATS.ordersThisMonth,
    };
  }, [tailors]);

  if (role !== "admin") {
    return (
      <PagePlaceholder
        icon={AlertTriangle}
        eyebrow="Restricted"
        title="Administrators only"
        description="Switch to the Administrator role from the header to preview this page."
      >
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/">Return home</Link>
          </Button>
        </div>
      </PagePlaceholder>
    );
  }

  const addTailor = (t: Omit<ManagedTailor, "id" | "bannedUntil">) => {
    setTailors((list) => [...list, { id: crypto.randomUUID(), ...t, bannedUntil: null }]);
    toast.success(`${t.atelier} provisioned.`);
  };

  const saveTailor = (next: ManagedTailor) => {
    setTailors((list) => list.map((t) => (t.id === next.id ? next : t)));
    toast.success("Tailor updated.");
  };

  const banTailor = (id: string, bannedUntil: string) => {
    setTailors((list) => list.map((t) => (t.id === id ? { ...t, bannedUntil } : t)));
    toast.success("Tailor banned.");
  };

  const unbanTailor = (id: string) => {
    setTailors((list) => list.map((t) => (t.id === id ? { ...t, bannedUntil: null } : t)));
    toast.success("Tailor reinstated.");
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Operations</p>
            <h1 className="font-display text-4xl text-primary">Admin Dashboard</h1>
          </div>
        </div>
        <AddTailorDialog onAdd={addTailor} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total customers" value={stats.customers.toLocaleString()} accent />
        <StatCard icon={UserCheck} label="Active tailors" value={String(stats.active)} />
        <StatCard icon={Ban} label="Banned tailors" value={String(stats.banned)} destructive />
        <StatCard icon={Package} label="Orders this month" value={String(stats.orders)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl text-primary">Tailors</CardTitle>
          <CardDescription>
            Manage atelier accounts. Local preview only — will sync once Cloud is enabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TailorsTable
            tailors={tailors}
            onEdit={setEditing}
            onBan={setBanning}
            onUnban={unbanTailor}
          />
        </CardContent>
      </Card>

      <EditTailorDialog tailor={editing} onClose={() => setEditing(null)} onSave={saveTailor} />
      <BanTailorDialog tailor={banning} onClose={() => setBanning(null)} onBan={banTailor} />
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, accent, destructive,
}: {
  icon: typeof Users; label: string; value: string; accent?: boolean; destructive?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg ${
            destructive
              ? "bg-destructive/10 text-destructive"
              : accent
              ? "bg-accent/20 text-accent-foreground"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl text-primary">{value}</p>
    </Card>
  );
}

function isBanned(until: string | null) {
  if (!until) return false;
  if (until === "permanent") return true;
  return new Date(until).getTime() > Date.now();
}
