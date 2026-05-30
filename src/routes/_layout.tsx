import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OrdersProvider } from "@/context/OrdersContext";

export const Route = createFileRoute("/_layout")({
  component: () => (
    <OrdersProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </OrdersProvider>
  ),
});
