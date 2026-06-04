import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useOrders } from "@/context/OrdersContext";
import { InvoiceView } from "@/components/wizard/step5/InvoiceView";
import { OrderTrackingView } from "@/components/wizard/step5/OrderTrackingView";

export const Route = createFileRoute("/_layout/invoice/$orderId")({
  head: () => ({ meta: [{ title: "Invoice — Khayyat" }] }),
  component: InvoicePage,
});

function InvoicePage() {
  const { orderId } = Route.useParams();
  const { getOrder } = useOrders();

  const specificOrder = getOrder(orderId);

  if (!specificOrder) {
    return (
      <PageShell>
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
      </PageShell>
    );
  }

  if (specificOrder.status === "confirmed") {
    return (
      <PageShell>
        {/* Single unified tracking view for the whole order */}
        <OrderTrackingView order={specificOrder} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <InvoiceView order={specificOrder} />
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
