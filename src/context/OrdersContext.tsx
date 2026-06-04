import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { DesignConfig, OrderItemDraft } from "@/components/wizard/WizardContext";
import {
  FABRICS, LABOR_BASE, EMBROIDERY_FEE, DELIVERY_FEE, TAX_RATE,
} from "@/lib/wizard-data";
import { supabase } from "@/lib/supabase";
import { useApp } from "./AppContext";

export type OrderStage = 0 | 1 | 2 | 3 | 4;
export const STAGE_LABELS = [
  "Order Details Received",
  "Tailor Working on Order",
  "Order Ready",
  "Out for Delivery",
  "Delivered",
] as const;

export type PaymentMethod = "cod" | "card";

export type Pricing = {
  fabric: number;
  labor: number;
  delivery: number;
  tax: number;
  total: number;
};

export type ActivityLogEntry = {
  id: string;
  timestamp: string;
  stage: OrderStage;
  note: string;
};

export type OrderItem = {
  id: string;
  tailorId: string;
  design: DesignConfig;
  measurements: Record<string, number>;
  pricing: Pricing;
  stage: OrderStage;
  activityLog: ActivityLogEntry[];
};

export type Order = {
  id: string;
  customerId: string;
  createdAt: number;
  items: OrderItem[];
  pricing: Pricing;
  payment?: PaymentMethod;
  status: "pending_payment" | "confirmed";
};

export function computePricing(design: DesignConfig): Pricing {
  const fabric = FABRICS.find((f) => f.id === design.fabric)?.price ?? 60;
  const labor = LABOR_BASE + design.embroideryPlacements.length * EMBROIDERY_FEE;
  const delivery = DELIVERY_FEE;
  const subtotal = fabric + labor + delivery;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { fabric, labor, delivery, tax, total };
}

type Ctx = {
  orders: Order[];
  isLoading: boolean;
  createOrder: (input: {
    customerId: string;
    cart: OrderItemDraft[];
  }) => Promise<string>;
  getOrder: (id: string) => Order | undefined;
  confirmPayment: (id: string, method: PaymentMethod) => Promise<void>;
  advanceStage: (orderId: string, itemId: string) => Promise<void>;
};

const OrdersCtx = createContext<Ctx | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useApp();

  // ── Fetch orders from Supabase whenever the logged-in user changes ──────────
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user.id) return;
    setIsLoading(true);
    try {
      // Fetch orders for this user (customer) OR items assigned to this user (tailor)
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Also fetch orders where any item has this tailor's id (for tailor view)
      const { data: tailorItemOrders, error: tailorError } = await supabase
        .from("order_items")
        .select("order_id")
        .eq("tailor_id", user.id);

      if (tailorError) throw tailorError;

      // Merge the order IDs we need
      const tailorOrderIds = (tailorItemOrders ?? []).map((r: any) => r.order_id);
      const customerOrderIds = (ordersData ?? []).map((r: any) => r.id);
      const allOrderIds = [...new Set([...customerOrderIds, ...tailorOrderIds])];

      if (allOrderIds.length === 0) {
        setOrders([]);
        return;
      }

      // Fetch all those orders with their items and activity logs
      const { data: fullOrders, error: fullOrdersError } = await supabase
        .from("orders")
        .select(`
          id,
          customer_id,
          status,
          payment_method,
          total_price,
          created_at,
          order_items (
            id,
            tailor_id,
            design,
            measurements,
            pricing,
            stage,
            activity_logs (
              id,
              stage,
              note,
              created_at
            )
          )
        `)
        .in("id", allOrderIds)
        .order("created_at", { ascending: false });

      if (fullOrdersError) throw fullOrdersError;

      const mapped: Order[] = (fullOrders ?? []).map((o: any) => {
        const itemPricings: Pricing[] = (o.order_items ?? []).map((i: any) => i.pricing as Pricing);
        const combinedPricing: Pricing = itemPricings.reduce(
          (acc, p) => ({
            fabric: acc.fabric + p.fabric,
            labor: acc.labor + p.labor,
            delivery: acc.delivery + p.delivery,
            tax: acc.tax + p.tax,
            total: acc.total + p.total,
          }),
          { fabric: 0, labor: 0, delivery: 0, tax: 0, total: 0 }
        );

        return {
          id: o.id,
          customerId: o.customer_id,
          createdAt: new Date(o.created_at).getTime(),
          status: o.status as Order["status"],
          payment: o.payment_method as PaymentMethod | undefined,
          pricing: combinedPricing,
          items: (o.order_items ?? []).map((item: any) => ({
            id: item.id,
            tailorId: item.tailor_id,
            design: item.design as DesignConfig,
            measurements: item.measurements as Record<string, number>,
            pricing: item.pricing as Pricing,
            stage: item.stage as OrderStage,
            activityLog: (item.activity_logs ?? []).map((log: any) => ({
              id: log.id,
              timestamp: log.created_at,
              stage: log.stage as OrderStage,
              note: log.note ?? "",
            })).sort((a: ActivityLogEntry, b: ActivityLogEntry) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ),
          })),
        };
      });

      setOrders(mapped);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Create Order ────────────────────────────────────────────────────────────
  const createOrder: Ctx["createOrder"] = async ({ customerId, cart }) => {
    const id = `o-${Date.now().toString(36)}`;

    let totalFabric = 0, totalLabor = 0, totalDelivery = 0, totalTax = 0, total = 0;

    const items: OrderItem[] = cart.map((draft, idx) => {
      const numericM: Record<string, number> = {};
      for (const [k, v] of Object.entries(draft.measurements)) {
        if (typeof v === "number") numericM[k] = v;
      }
      const pricing = computePricing(draft.design);
      totalFabric += pricing.fabric;
      totalLabor += pricing.labor;
      totalDelivery += pricing.delivery;
      totalTax += pricing.tax;
      total += pricing.total;

      return {
        id: `item-${Date.now().toString(36)}-${idx}`,
        tailorId: draft.tailorId,
        design: draft.design,
        measurements: numericM,
        pricing,
        stage: 0 as OrderStage,
        activityLog: [],
      };
    });

    const combinedPricing: Pricing = {
      fabric: totalFabric, labor: totalLabor,
      delivery: totalDelivery, tax: totalTax,
      total: Math.round(total * 100) / 100,
    };

    const order: Order = {
      id, customerId, createdAt: Date.now(),
      items, pricing: combinedPricing, status: "pending_payment",
    };

    // ── Persist to Supabase ──────────────────────────────────────────────────
    try {
      const { error: orderError } = await supabase.from("orders").insert({
        id,
        customer_id: customerId,
        status: "pending_payment",
        total_price: combinedPricing.total,
      });
      if (orderError) throw orderError;

      for (const item of items) {
        const { error: itemError } = await supabase.from("order_items").insert({
          id: item.id,
          order_id: id,
          tailor_id: item.tailorId,
          design: item.design,
          measurements: item.measurements,
          pricing: item.pricing,
          stage: 0,
        });
        if (itemError) throw itemError;

        const { error: logError } = await supabase.from("activity_logs").insert({
          order_item_id: item.id,
          stage: 0,
          note: "Order created and pending payment.",
        });
        if (logError) console.warn("Activity log insert failed:", logError);
      }

      // Optimistic update — refetch in background
      setOrders((o) => [order, ...o]);
      fetchOrders();
      return id;
    } catch (e) {
      console.error("Failed to create order:", e);
      throw e;
    }
  };

  // ── Confirm Payment ─────────────────────────────────────────────────────────
  const confirmPayment = async (id: string, method: PaymentMethod) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "confirmed", payment_method: method })
        .eq("id", id);
      if (error) throw error;

      // Add a payment-confirmed log entry to each item of this order
      const order = orders.find((o) => o.id === id);
      if (order) {
        for (const item of order.items) {
          await supabase.from("activity_logs").insert({
            order_item_id: item.id,
            stage: item.stage,
            note: `Payment confirmed via ${method === "card" ? "Credit Card" : "Cash on Delivery"}. Tailor notified.`,
          });
        }
      }

      // Refresh from DB
      await fetchOrders();
    } catch (e) {
      console.error("Failed to confirm payment:", e);
    }
  };

  // ── Advance Stage ───────────────────────────────────────────────────────────
  const advanceStage = async (orderId: string, itemId: string) => {
    const order = orders.find((o) => o.id === orderId);
    const item = order?.items.find((i) => i.id === itemId);
    if (!item || item.stage >= 4) return;

    const nextStage = (item.stage + 1) as OrderStage;
    try {
      const { error: stageError } = await supabase
        .from("order_items")
        .update({ stage: nextStage })
        .eq("id", itemId);
      if (stageError) throw stageError;

      const { error: logError } = await supabase.from("activity_logs").insert({
        order_item_id: itemId,
        stage: nextStage,
        note: `Order advanced to: ${STAGE_LABELS[nextStage]}`,
      });
      if (logError) console.warn("Activity log insert failed:", logError);

      await fetchOrders();
    } catch (e) {
      console.error("Failed to advance stage:", e);
    }
  };

  const value: Ctx = {
    orders,
    isLoading,
    createOrder,
    getOrder: (id) => orders.find((o) => o.id === id),
    confirmPayment,
    advanceStage,
  };

  return <OrdersCtx.Provider value={value}>{children}</OrdersCtx.Provider>;
}

export function useOrders() {
  const c = useContext(OrdersCtx);
  if (!c) throw new Error("useOrders must be used inside OrdersProvider");
  return c;
}
