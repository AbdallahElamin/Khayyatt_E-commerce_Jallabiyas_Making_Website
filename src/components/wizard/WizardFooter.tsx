import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useWizard } from "./WizardContext";
import { useOrders } from "@/context/OrdersContext";
import { toast } from "sonner";

export function WizardFooter() {
  const { step, back, next, canAdvance, tailorId, design, measurements } = useWizard();
  const { createOrder } = useOrders();
  const navigate = useNavigate();

  if (step === 4) {
    const confirm = async () => {
      if (!tailorId) return;
      const id = await createOrder({ tailorId, design, measurements });
      toast.success("Order created — proceed to payment.");
      navigate({ to: "/invoice/$orderId", params: { orderId: id } });
    };
    return (
      <div className="mx-auto mt-10 flex max-w-5xl flex-col-reverse items-stretch justify-between gap-3 px-4 pb-16 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <Button variant="outline" onClick={back} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button id="wizard-confirm-payment-btn" onClick={confirm} className="gap-2">
          <CreditCard className="h-4 w-4" /> Confirm &amp; Proceed to Payment
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 flex max-w-5xl items-center justify-between px-4 pb-16 sm:px-6 lg:px-8">
      <Button variant="outline" onClick={back} disabled={step === 1} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <Button onClick={next} disabled={!canAdvance} className="gap-2">
        Next <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
