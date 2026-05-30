import { createContext, useContext, useState, type ReactNode } from "react";
import type { DesignConfig, Measurements } from "@/components/wizard/WizardContext";
import {
  FABRICS, LABOR_BASE, EMBROIDERY_FEE, DELIVERY_FEE, TAX_RATE,
} from "@/lib/wizard-data";

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

export type Order = {
  id: string;
  createdAt: number;
  tailorId: string;
  design: DesignConfig;
  measurements: Record<string, number>;
  pricing: Pricing;
  payment?: PaymentMethod;
  status: "pending_payment" | "confirmed";
  stage: OrderStage;
};

function computePricing(design: DesignConfig): Pricing {
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
  createOrder: (input: {
    tailorId: string;
    design: DesignConfig;
    measurements: Measurements;
  }) => Promise<string>;
  getOrder: (id: string) => Order | undefined;
  confirmPayment: (id: string, method: PaymentMethod) => void;
  /** Confirms every pending_payment order at once with the given payment method. */
  confirmAllPending: (method: PaymentMethod) => void;
  advanceStage: (id: string) => Promise<void>;
};

const OrdersCtx = createContext<Ctx | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder: Ctx["createOrder"] = async ({ tailorId, design, measurements }) => {
    const id = `o-${Date.now().toString(36)}`;
    const numericM: Record<string, number> = {};
    for (const [k, v] of Object.entries(measurements)) {
      if (typeof v === "number") numericM[k] = v;
    }
    const order: Order = {
      id, createdAt: Date.now(), tailorId, design,
      measurements: numericM,
      pricing: computePricing(design),
      status: "pending_payment",
      stage: 0,
    };

    try {
      console.warn("Database persistence pending Supabase connection");
      // await supabase.from('orders').insert({
      //   id, tailor_id: tailorId, design, measurements: numericM,
      //   pricing: computePricing(design), status: 'pending_payment', stage: 0
      // });
      setOrders((o) => [order, ...o]);
      return id;
    } catch (e) {
      console.error("Failed to create order:", e);
      throw e;
    }
  };

  const value: Ctx = {
    orders,
    createOrder,
    getOrder: (id) => orders.find((o) => o.id === id),
    confirmPayment: (id, method) =>
      setOrders((list) =>
        list.map((o) => o.id === id ? { ...o, payment: method, status: "confirmed", stage: 0 } : o)
      ),
    confirmAllPending: (method) =>
      setOrders((list) =>
        list.map((o) =>
          o.status === "pending_payment"
            ? { ...o, payment: method, status: "confirmed", stage: 0 }
            : o
        )
      ),
    advanceStage: async (id) => {
      try {
        console.warn("Database persistence pending Supabase connection");
        // const currentStage = orders.find(o => o.id === id)?.stage || 0;
        // await supabase.from('orders').update({ stage: Math.min(4, currentStage + 1) }).eq('id', id);
        setOrders((list) => list.map((o) => o.id === id ? { ...o, stage: Math.min(4, o.stage + 1) as OrderStage } : o));
      } catch (e) {
        console.error("Failed to advance stage:", e);
      }
    },
  };

  return <OrdersCtx.Provider value={value}>{children}</OrdersCtx.Provider>;
}

export function useOrders() {
  const c = useContext(OrdersCtx);
  if (!c) throw new Error("useOrders must be used inside OrdersProvider");
  return c;
}
