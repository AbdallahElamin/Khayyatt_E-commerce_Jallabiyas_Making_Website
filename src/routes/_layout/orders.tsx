import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight } from "lucide-react";
import { useOrders, STAGE_LABELS } from "@/context/OrdersContext";
import { TAILOR_PROFILES } from "@/lib/mock-data";

export const Route = createFileRoute("/_layout/orders")({
  head: () => ({ meta: [{ title: "Order Tracking — Khayyat" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { orders } = useOrders();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent-foreground">Order tracking</p>
          <h1 className="font-display text-3xl text-primary">My Orders</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <p className="font-display text-xl text-primary">No commissions yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Design your first Jallabiya through the wizard to see it tracked here.
          </p>
          <Button asChild className="mt-6">
            <Link to="/wizard">Start designing</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const tailor = TAILOR_PROFILES.find((t) => t.id === o.tailorId);
            return (
              <Link
                key={o.id}
                to="/invoice/$orderId"
                params={{ orderId: o.id }}
                className="group block"
              >
                <Card className="flex items-center gap-4 p-5 transition-colors group-hover:border-primary">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-sm text-primary-foreground"
                    style={{ background: tailor?.avatarGradient }}
                  >
                    {tailor?.initials ?? "—"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-medium text-foreground">Order {o.id}</p>
                      <Badge variant={o.status === "confirmed" ? "default" : "outline"} className="text-[10px]">
                        {o.status === "confirmed" ? STAGE_LABELS[o.stage] : "Pending payment"}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {tailor?.atelier} · {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg text-primary">${o.pricing.total.toFixed(2)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
