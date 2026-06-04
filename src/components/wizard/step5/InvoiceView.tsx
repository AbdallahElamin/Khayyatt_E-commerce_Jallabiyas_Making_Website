import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Banknote, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useOrders, type Order, type PaymentMethod } from "@/context/OrdersContext";
import { TAILOR_PROFILES } from "@/lib/mock-data";
import { FABRICS } from "@/lib/wizard-data";

// ─── Component ───────────────────────────────────────────────────────────────

export function InvoiceView({ order }: { order: Order }) {
  const { confirmPayment } = useOrders();
  const [method, setMethod] = useState<PaymentMethod>("cod");

  const isSingle = order.items.length === 1;

  const confirm = () => {
    confirmPayment(order.id, method);
    toast.success(
      isSingle
        ? "Order confirmed — tracking is live."
        : `Order with ${order.items.length} items confirmed — tracking is live.`,
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* ── Invoice breakdown ── */}
      <Card className="p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">Invoice</p>
            <h2 className="font-display text-2xl text-primary">
              Order {order.id}
            </h2>
          </div>
          {isSingle && (
            <p className="text-xs text-muted-foreground">
              {TAILOR_PROFILES.find((t) => t.id === order.items[0].tailorId)?.atelier}
            </p>
          )}
        </div>

        {/* Per-item line items */}
        {order.items.map((item, idx) => {
          const tailor = TAILOR_PROFILES.find((t) => t.id === item.tailorId);
          const fabric = FABRICS.find((f) => f.id === item.design.fabric);
          const embCount = item.design.embroideryPlacements.length;

          return (
            <div key={item.id} className="mt-5">
              {!isSingle && (
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
                  Item {idx + 1} — {tailor?.atelier ?? "Tailor"} · {fabric?.label ?? "Base fabric"}
                </p>
              )}
              <div className="divide-y divide-border/60 text-sm">
                <LineRow
                  label={`Fabric — ${fabric?.label ?? "Base"}`}
                  value={item.pricing.fabric}
                />
                <LineRow
                  label={`Tailoring labor (${embCount} embroidery placement${embCount === 1 ? "" : "s"})`}
                  value={item.pricing.labor}
                />
                <LineRow label="Delivery routing"     value={item.pricing.delivery} />
                <LineRow label="Tax (15%)"             value={item.pricing.tax} />
                {!isSingle && (
                  <div className="flex items-center justify-between py-2 font-medium text-foreground">
                    <span>Sub-total</span>
                    <span>${item.pricing.total.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Grand total — only meaningful for multi-order */}
        {!isSingle && (
          <div className="mt-4 border-t border-border/60 pt-2 text-sm divide-y divide-border/40">
            <LineRow label={`Combined fabric (${order.items.length} garments)`} value={order.pricing.fabric} />
            <LineRow label="Combined labor"    value={order.pricing.labor} />
            <LineRow label="Combined delivery" value={order.pricing.delivery} />
            <LineRow label="Combined tax"      value={order.pricing.tax} />
          </div>
        )}

        <div className="mt-2 flex items-center justify-between py-4">
          <span className="font-display text-lg text-primary">Grand Total</span>
          <span className="font-display text-2xl text-primary">${order.pricing.total.toFixed(2)}</span>
        </div>
      </Card>

      {/* ── Payment method ── */}
      <Card className="p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">Payment</p>
        <h3 className="mt-1 font-display text-xl text-primary">Choose a method</h3>

        <RadioGroup
          value={method}
          onValueChange={(v) => setMethod(v as PaymentMethod)}
          className="mt-4 gap-3"
        >
          <PaymentOption
            value="cod"
            current={method}
            icon={<Banknote className="h-4 w-4" />}
            title="Cash on Delivery"
            subtitle="Pay when your order arrives."
          />
          <PaymentOption
            value="card"
            current={method}
            icon={<CreditCard className="h-4 w-4" />}
            title="Credit Card"
            subtitle="Pay now, securely."
          />
        </RadioGroup>

        {method === "card" && (
          <div className="mt-4 space-y-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Card number</Label>
              <Input disabled placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Expiry</Label>
                <Input disabled placeholder="MM/YY" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CVC</Label>
                <Input disabled placeholder="123" />
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> Mock checkout — no real card is charged.
            </p>
          </div>
        )}

        <Button id="confirm-orders-btn" onClick={confirm} className="mt-6 w-full gap-2">
          Confirm {isSingle ? "Order" : `Order (${order.items.length} items)`}
        </Button>
      </Card>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function LineRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">${value.toFixed(2)}</span>
    </div>
  );
}

function PaymentOption({
  value, current, icon, title, subtitle,
}: {
  value: PaymentMethod;
  current: PaymentMethod;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const active = current === value;
  return (
    <label
      htmlFor={`pm-${value}`}
      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
        active ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"
      }`}
    >
      <RadioGroupItem id={`pm-${value}`} value={value} />
      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </label>
  );
}
