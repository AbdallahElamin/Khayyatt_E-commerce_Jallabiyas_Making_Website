import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight, Scissors } from "lucide-react";
import { useOrders, STAGE_LABELS } from "@/context/OrdersContext";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/_layout/orders")({
  head: () => ({ meta: [{ title: "Order Tracking — Khayyat" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { orders } = useOrders();
  const { role, user } = useApp();

  const customerOrders = orders.filter((o) => o.customerId === user.id);
  
  const tailorItems = orders.flatMap((o) =>
    o.items
      .filter((i) => i.tailorId === user.id)
      .map((i) => ({ orderId: o.id, orderCreatedAt: o.createdAt, orderStatus: o.status, item: i }))
  );

  if (role === "tailor") {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <Scissors className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent-foreground">Atelier Dashboard</p>
            <h1 className="font-display text-3xl text-primary">Commissions Received</h1>
          </div>
        </div>

        {tailorItems.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <p className="font-display text-xl text-primary">No commissions yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              When a customer orders a Jallabiyah from your atelier, it will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tailorItems.map(({ orderId, orderCreatedAt, orderStatus, item }) => (
              <Link key={item.id} to="/invoice/$orderId" params={{ orderId }} className="group block">
                <Card className="flex items-center gap-4 p-5 transition-colors group-hover:border-primary">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-medium text-foreground">Order {orderId}</p>
                      <Badge variant={orderStatus === "confirmed" ? "default" : "outline"} className="text-[10px]">
                        {orderStatus === "confirmed" ? STAGE_LABELS[item.stage] : "Pending payment"}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      Item {item.id} · {new Date(orderCreatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg text-primary">${item.pricing.total.toFixed(2)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Customer View
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

      {customerOrders.length === 0 ? (
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
          {customerOrders.map((o) => (
            <Link key={o.id} to="/invoice/$orderId" params={{ orderId: o.id }} className="group block">
              <Card className="flex items-center gap-4 p-5 transition-colors group-hover:border-primary">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="font-medium text-foreground">Order {o.id}</p>
                    <Badge variant={o.status === "confirmed" ? "default" : "outline"} className="text-[10px]">
                      {o.status === "confirmed" ? "Confirmed" : "Pending payment"}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {o.items.length} {o.items.length === 1 ? "item" : "items"} · {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-primary">${o.pricing.total.toFixed(2)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
