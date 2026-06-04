/**
 * OrderTrackingView
 *
 * Shows a single unified tracking panel for a whole Order, regardless of how
 * many items it contains.  The progress bar reflects the *minimum* stage across
 * all items (the order is only as advanced as its least-progressed garment).
 * All activity log entries from all items are merged, sorted chronologically,
 * and displayed in a single table.
 *
 * Tailors see an "Advance Stage" button only for items assigned to them.
 * Customers see the same view but without any controls.
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useOrders, STAGE_LABELS, type Order, type OrderItem,
} from "@/context/OrdersContext";
import { useApp } from "@/context/AppContext";
import { TAILOR_PROFILES } from "@/lib/mock-data";

// ── Helper ────────────────────────────────────────────────────────────────────

function stageBadgeVariant(stage: number): "default" | "secondary" | "outline" {
  if (stage === 0) return "outline";
  if (stage >= 4) return "default";
  return "secondary";
}

// ── Main component ────────────────────────────────────────────────────────────

export function OrderTrackingView({ order }: { order: Order }) {
  const { advanceStage } = useOrders();
  const { role, user } = useApp();

  // The overall order stage = minimum stage across all items
  const overallStage = Math.min(...order.items.map((i) => i.stage));
  const pct = (overallStage / (STAGE_LABELS.length - 1)) * 100;

  // Merge + sort all activity log entries from every item
  const allLogs = order.items
    .flatMap((item) =>
      item.activityLog.map((log) => ({
        ...log,
        itemId: item.id,
        tailorId: item.tailorId,
      }))
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Items this tailor is responsible for (for the advance button)
  const myItems: OrderItem[] =
    role === "tailor"
      ? order.items.filter((i) => i.tailorId === user.id)
      : [];

  return (
    <div className="space-y-6">
      {/* ── Progress card ── */}
      <Card className="p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">
              Order tracking
            </p>
            <h2 className="font-display text-2xl text-primary">Order {order.id}</h2>
            <p className="text-sm text-muted-foreground">
              {order.items.length} {order.items.length === 1 ? "item" : "items"} ·{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Total paid</p>
            <p className="font-display text-xl text-primary">
              ${order.pricing.total.toFixed(2)}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {order.payment === "card" ? "Credit Card" : "Cash on Delivery"}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-10">
          <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-border" />
          <div
            className="absolute left-0 top-5 h-1 rounded-full bg-primary transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
          <ol
            className="relative grid"
            style={{ gridTemplateColumns: `repeat(${STAGE_LABELS.length}, 1fr)` }}
          >
            {STAGE_LABELS.map((label, i) => {
              const done = i < overallStage;
              const active = i === overallStage;
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

        {/* Per-item stage breakdown (when multi-item) */}
        {order.items.length > 1 && (
          <div className="mt-8 space-y-2 border-t border-border pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Item breakdown</p>
            {order.items.map((item, idx) => {
              const tailor = TAILOR_PROFILES.find((t) => t.id === item.tailorId);
              return (
                <div key={item.id} className="flex items-center justify-between gap-3 py-1">
                  <span className="text-sm text-foreground">
                    Item {idx + 1}
                    {tailor ? ` — ${tailor.atelier}` : ""}
                  </span>
                  <Badge variant={stageBadgeVariant(item.stage)} className="text-[10px]">
                    {STAGE_LABELS[item.stage]}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {/* Advance stage — Tailors only, per item they own */}
        {myItems.length > 0 && (
          <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Advance your item(s)
            </p>
            {myItems.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  {order.items.length > 1 ? `Item ${order.items.indexOf(item) + 1}` : "This item"} —{" "}
                  <span className="text-foreground">{STAGE_LABELS[item.stage]}</span>
                </span>
                {item.stage < STAGE_LABELS.length - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => await advanceStage(order.id, item.id)}
                    className="gap-1 text-xs"
                  >
                    Advance stage <ChevronRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Unified activity log ── */}
      <Card className="p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">Tracking details</p>
        <h3 className="mt-1 font-display text-xl text-primary">Activity log</h3>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Timestamp</TableHead>
                {order.items.length > 1 && <TableHead className="w-28">Item</TableHead>}
                <TableHead className="w-52">Stage</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={order.items.length > 1 ? 4 : 3} className="py-10 text-center text-sm text-muted-foreground">
                    No tracking events yet.
                  </TableCell>
                </TableRow>
              ) : (
                allLogs.map((log) => {
                  const itemIndex = order.items.findIndex((i) => i.id === log.itemId);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      {order.items.length > 1 && (
                        <TableCell className="text-muted-foreground">
                          Item {itemIndex + 1}
                        </TableCell>
                      )}
                      <TableCell className="font-medium text-foreground">
                        {STAGE_LABELS[log.stage]}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.note}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
