import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders, STAGE_LABELS, type OrderItem, type PaymentMethod } from "@/context/OrdersContext";
import { useApp } from "@/context/AppContext";
import { TAILOR_PROFILES } from "@/lib/mock-data";

export function TrackingView({ orderId, item, paymentMethod }: { orderId: string; item: OrderItem; paymentMethod: PaymentMethod }) {
  const { advanceStage } = useOrders();
  const { role } = useApp();
  const tailor = TAILOR_PROFILES.find((t) => t.id === item.tailorId);
  const pct = (item.stage / (STAGE_LABELS.length - 1)) * 100;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">
              Order tracking
            </p>
            <h2 className="font-display text-2xl text-primary">Item {item.id}</h2>
            <p className="text-sm text-muted-foreground">
              {tailor?.atelier}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Item total</p>
            <p className="font-display text-xl text-primary">${item.pricing.total.toFixed(2)}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {paymentMethod === "card" ? "Credit Card" : "Cash on Delivery"}
            </p>
          </div>
        </div>

        <div className="relative mt-10">
          <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-border" />
          <div
            className="absolute left-0 top-5 h-1 rounded-full bg-primary transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
          <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${STAGE_LABELS.length}, 1fr)` }}>
            {STAGE_LABELS.map((label, i) => {
              const done = i < item.stage;
              const active = i === item.stage;
              return (
                <li key={label} className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full border-2 bg-background text-sm font-semibold transition-colors",
                      done && "border-primary bg-primary text-primary-foreground",
                      active && "border-primary text-primary shadow-[var(--shadow-luxe)] animate-pulse",
                      !done && !active && "border-border text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "mt-2 max-w-[120px] text-[10px] uppercase leading-snug tracking-wider sm:text-[11px]",
                      done || active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {item.stage < STAGE_LABELS.length - 1 && role === "tailor" && (
          <div className="mt-8 flex justify-end">
            <Button variant="ghost" size="sm" onClick={async () => await advanceStage(orderId, item.id)} className="gap-1 text-xs">
              Advance stage (preview) <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">Tracking details</p>
        <h3 className="mt-1 font-display text-xl text-primary">Activity log</h3>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Timestamp</TableHead>
                <TableHead className="w-56">Stage</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.activityLog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                    No tracking events yet.
                  </TableCell>
                </TableRow>
              ) : (
                item.activityLog.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {STAGE_LABELS[log.stage]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.note}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
