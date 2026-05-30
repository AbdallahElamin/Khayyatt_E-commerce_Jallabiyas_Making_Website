import { createFileRoute } from "@tanstack/react-router";
import { WizardProvider, useWizard } from "@/components/wizard/WizardContext";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { WizardFooter } from "@/components/wizard/WizardFooter";
import { TailorDropdown } from "@/components/wizard/step1/TailorDropdown";
import { MockMap } from "@/components/wizard/step1/MockMap";
import { PresetBar } from "@/components/wizard/step2/PresetBar";
import { CustomizerGrid } from "@/components/wizard/step2/CustomizerGrid";
import { MeasurementsForm } from "@/components/wizard/step3/MeasurementsForm";
import { OrderSummary } from "@/components/wizard/step4/OrderSummary";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/wizard")({
  head: () => ({
    meta: [
      { title: "Design Wizard — Khayyat" },
      { name: "description", content: "Design your bespoke Jallabiya in four guided steps." },
    ],
  }),
  component: () => (
    <WizardProvider>
      <WizardProgress />
      <WizardBody />
      <WizardFooter />
    </WizardProvider>
  ),
});

function WizardBody() {
  const { step } = useWizard();
  return (
    <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <MeasurementsForm />}
      {step === 4 && <OrderSummary />}
    </div>
  );
}

function Step1() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <TailorDropdown />
      <MockMap />
    </div>
  );
}

function Step2() {
  return (
    <div className="space-y-6">
      <PresetBar />
      <Card className="p-6">
        <CustomizerGrid />
      </Card>
    </div>
  );
}
