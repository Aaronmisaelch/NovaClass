"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import NumberFlow from "@number-flow/react";

export function NumberFlowSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="w-full pt-8">
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-nova-navy/10">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="relative block h-5 w-5 rounded-full border-2 border-nova-white bg-nova-electric shadow-[0_2px_8px_rgba(10,109,253,0.4)] outline-none transition-transform focus-visible:scale-110"
          aria-label="Valor"
        >
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-nova-navy px-2.5 py-1 text-xs font-semibold text-nova-white shadow-[0_8px_20px_-8px_rgba(4,14,60,0.5)]">
            <NumberFlow value={value} />
          </span>
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  );
}
