import { createContext, useContext, useState, type ReactNode } from "react";
import type { DesignConfig, OrderItemDraft } from "@/components/wizard/WizardContext";
import {
  FABRICS, LABOR_BASE, EMBROIDERY_FEE, DELIVERY_FEE, TAX_RATE,
} from "@/lib/wizard-data";
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
  createOrder: (input: {
    customerId: string;
    cart: OrderItemDraft[];
  }) => Promise<string>;
  getOrder: (id: string) => Order | undefined;
  confirmPayment: (id: string, method: PaymentMethod) => void;
  confirmAllPending: (method: PaymentMethod) => void;
  advanceStage: (orderId: string, itemId: string) => Promise<void>;
};

const OrdersCtx = createContext<Ctx | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder: Ctx["createOrder"] = async ({ customerId, cart }) => {
    const id = `o-${Date.now().toString(36)}`;
    
    let totalFabric = 0;
    let totalLabor = 0;
    let totalDelivery = 0;
    let totalTax = 0;
    let total = 0;

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
        stage: 0,
        activityLog: [
          {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            stage: 0,
            note: "Order created and pending payment.",
          }
        ]
      };
    });

    const combinedPricing: Pricing = {
      fabric: totalFabric,
      labor: totalLabor,
      delivery: totalDelivery,
      tax: totalTax,
      total: Math.round(total * 100) / 100,
    };

    const order: Order = {
      id,
      customerId,
      createdAt: Date.now(),
      items,
      pricing: combinedPricing,
      status: "pending_payment",
    };

    try {
      console.warn("Database persistence pending Supabase connection");
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
        list.map((o) => {
          if (o.id === id) {
            const confirmedItems = o.items.map(item => ({
              ...item,
              activityLog: [
                ...item.activityLog,
                {
                  id: crypto.randomUUID(),
                  timestamp: new Date().toISOString(),
                  stage: 0 as OrderStage,
                  note: `Payment confirmed via ${method === 'card' ? 'Credit Card' : 'Cash on Delivery'}. Tailor notified.`,
                }
              ]
            }));
            return { ...o, payment: method, status: "confirmed", items: confirmedItems };
          }
          return o;
        })
      ),
    confirmAllPending: (method) =>
      setOrders((list) =>
        list.map((o) => {
          if (o.status === "pending_payment") {
            const confirmedItems = o.items.map(item => ({
              ...item,
              activityLog: [
                ...item.activityLog,
                {
                  id: crypto.randomUUID(),
                  timestamp: new Date().toISOString(),
                  stage: 0 as OrderStage,
                  note: `Payment confirmed via ${method === 'card' ? 'Credit Card' : 'Cash on Delivery'}. Tailor notified.`,
                }
              ]
            }));
            return { ...o, payment: method, status: "confirmed", items: confirmedItems };
          }
          return o;
        })
      ),
    advanceStage: async (orderId, itemId) => {
      try {
        console.warn("Database persistence pending Supabase connection");
        setOrders((list) => 
          list.map((o) => {
            if (o.id === orderId) {
              const updatedItems = o.items.map(item => {
                if (item.id === itemId && item.stage < 4) {
                  const nextStage = (item.stage + 1) as OrderStage;
                  return {
                    ...item,
                    stage: nextStage,
                    activityLog: [
                      ...item.activityLog,
                      {
                        id: crypto.randomUUID(),
                        timestamp: new Date().toISOString(),
                        stage: nextStage,
                        note: `Order advanced to: ${STAGE_LABELS[nextStage]}`,
                      }
                    ]
                  };
                }
                return item;
              });
              return { ...o, items: updatedItems };
            }
            return o;
          })
        );
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
