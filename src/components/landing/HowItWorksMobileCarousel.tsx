"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StepShowcaseCard, { type StepShowcaseItem } from "@/components/landing/StepShowcaseCard";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type HowItWorksMobileCarouselProps = {
  steps: StepShowcaseItem[];
};

export default function HowItWorksMobileCarousel({
  steps,
}: HowItWorksMobileCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = steps.length - 1;

  const goToStep = (index: number) => {
    setActiveIndex(index);
  };

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? lastIndex : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current === lastIndex ? 0 : current + 1));
  };

  return (
    <div
      className="lg:hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Pasos para usar BenefitQR"
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {steps.map((step) => (
            <div key={step.number} className="min-w-full px-0.5">
              <StepShowcaseCard {...step} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            onClick={goToPrevious}
            aria-label="Ver paso anterior"
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            onClick={goToNext}
            aria-label="Ver paso siguiente"
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2" aria-label="Indicadores de pasos">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => goToStep(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-border-default hover:bg-primary/40",
                )}
                aria-label={`Ir al paso ${step.number}`}
                aria-pressed={isActive}
              />
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-sm text-text-muted" aria-live="polite">
        Paso {activeIndex + 1} de {steps.length}: {steps[activeIndex]?.title}
      </p>
    </div>
  );
}
