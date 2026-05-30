import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useOrders } from "@/context/OrdersContext";
import { InvoiceView } from "@/components/wizard/step5/InvoiceView";
import { TrackingView } from "@/components/wizard/step5/TrackingView";

export const Route = createFileRoute("/_layout/invoice/$orderId")({
  head: () => ({ meta: [{ title: "Invoice — Khayyat" }] }),
  component: InvoicePage,
});

function InvoicePage() {
  const { orderId } = Route.useParams();
  const { getOrder, orders } = useOrders();

  // If the URL points to a *confirmed* order (e.g. navigating back from the
  // orders list) show that order's tracking view — no aggregation needed.
  const specificOrder = getOrder(orderId);
  if (specificOrder?.status === "confirmed") {
    return (
      <PageShell>
        <TrackingView order={specificOrder} />
      </PageShell>
    );
  }

  // Collect every pending-payment order so the invoice shows a combined total.
  // This is the fix: previously only `specificOrder` was passed, which was
  // undefined if the state update hadn't propagated or multiple orders existed.
  const pendingOrders = orders.filter((o) => o.status === "pending_payment");

  return (
    <PageShell>
      {pendingOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <h2 className="font-display text-2xl text-primary">Order not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This order may have been created in a previous session. Start a new
            design from the wizard.
          </p>
          <Button asChild className="mt-6">
            <Link to="/wizard">Start a new order</Link>
          </Button>
        </Card>
      ) : (
        <InvoiceView orders={pendingOrders} />
      )}
    </PageShell>
  );
}

/** Shared page chrome (back button + page padding). */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4" /> Back to orders
          </Link>
        </Button>
      </div>
      {children}
    </div>
  );
}
