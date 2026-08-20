"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Pencil } from "lucide-react";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { AnimatedNumber } from "@/app/(app)/dashboard/animated-number";
import { SelectDropdown } from "@/app/onboarding/select-dropdown";
import { BIRTHDAY_COLORS, type BirthdayColor, type BirthdayConfig } from "@/lib/dashboard/types";
import { MONTH_OPTIONS, daysInMonth, formatBirthDate, parseBirthDate } from "@/lib/dashboard/birthday";

// Each family reuses the exact saturation/lightness shape of the original
// pink pair (5 pastels + 5 paired vivid anchors) — only the base hue
// rotates, so every variant keeps the same soft, premium depth.
const PALETTES: Record<BirthdayColor, { pastels: string[]; vivids: string[] }> = {
  rosado: {
    pastels: ["#F7C5D8", "#F9D5E3", "#F2B8CE", "#FADCE8", "#F4C2D4"],
    vivids: ["#F0629A", "#EF6FA8", "#E85796", "#F4739F", "#EA6294"],
  },
  rojo: {
    pastels: ["#F7CAC5", "#F9DAD7", "#F2C0BA", "#FADEDB", "#F4C8C2"],
    vivids: ["#F06C60", "#EF7571", "#E86059", "#F48471", "#EA7262"],
  },
  azul: {
    pastels: ["#C5D8F7", "#D7E4F9", "#BAD0F2", "#DBE8FA", "#C2D5F4"],
    vivids: ["#609AF0", "#71AAEF", "#5997E8", "#719DF4", "#6294EA"],
  },
  celeste: {
    pastels: ["#C5E8F7", "#D7EFF9", "#BAE1F2", "#DBF1FA", "#C2E4F4"],
    vivids: ["#60C7F0", "#71D2EF", "#59C5E8", "#71C6F4", "#62BFEA"],
  },
  verde: {
    pastels: ["#C5F7DE", "#D7F9E8", "#BAF2D6", "#DBFAEA", "#C2F4DC"],
    vivids: ["#60F0A6", "#71EFA8", "#59E899", "#71F4B9", "#62EAA8"],
  },
  amarillo: {
    pastels: ["#F7EAC5", "#F9F1D7", "#F2E4BA", "#FAF2DB", "#F4E9C2"],
    vivids: ["#F0CA60", "#EFC771", "#E8BD59", "#F4DA71", "#EACA62"],
  },
};

function getDaysUntilNextBirthday(birthDate: string): number {
  const { month, day } = parseBirthDate(birthDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let next = new Date(today.getFullYear(), month - 1, day);
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, month - 1, day);
  }
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

export function BirthdayWidget({
  config,
  variant,
  onConfigChange,
  dragHandleProps,
}: {
  config: Partial<BirthdayConfig>;
  variant: number;
  onConfigChange: (config: BirthdayConfig) => void;
  dragHandleProps?: Record<string, unknown>;
}) {
  const [editing, setEditing] = useState(!config.name || !config.birthDate);
  const [name, setName] = useState(config.name ?? "");
  const initialBirthDate = config.birthDate ? parseBirthDate(config.birthDate) : null;
  const [birthDay, setBirthDay] = useState<number | null>(initialBirthDate?.day ?? null);
  const [birthMonth, setBirthMonth] = useState<number | null>(initialBirthDate?.month ?? null);
  const [color, setColor] = useState<BirthdayColor>(config.color ?? "rosado");

  const { pastels, vivids } = PALETTES[config.color ?? "rosado"];
  const pastel = pastels[variant % pastels.length];
  const vivid = vivids[variant % vivids.length];

  if (editing) {
    return (
      <WidgetCard dragHandleProps={dragHandleProps} className="justify-center gap-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre"
          className="w-full rounded-xl border border-nova-navy/10 px-3 py-2 text-sm text-nova-navy outline-none focus:border-nova-electric"
        />
        <div className="flex w-full gap-2">
          <SelectDropdown
            size="sm"
            value={birthDay}
            placeholder="Día"
            className="flex-1"
            options={Array.from({ length: birthMonth ? daysInMonth(birthMonth) : 31 }, (_, i) => ({
              value: i + 1,
              label: String(i + 1),
            }))}
            onChange={(day) => setBirthDay(day)}
          />
          <SelectDropdown
            size="sm"
            value={birthMonth}
            placeholder="Mes"
            className="flex-[1.4]"
            options={MONTH_OPTIONS}
            onChange={(month) => {
              setBirthMonth(month);
              if (birthDay && birthDay > daysInMonth(month)) {
                setBirthDay(daysInMonth(month));
              }
            }}
          />
        </div>
        <div className="flex w-full items-center justify-between gap-1.5 px-0.5">
          {BIRTHDAY_COLORS.map((option) => {
            const swatch = PALETTES[option.id].vivids[0];
            const selected = color === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setColor(option.id)}
                aria-label={option.label}
                aria-pressed={selected}
                className="relative flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: swatch,
                  boxShadow: selected
                    ? `0 0 0 2px var(--color-nova-white), 0 0 0 4px ${swatch}`
                    : "none",
                }}
              >
                {selected && <Check className="h-3.5 w-3.5 text-nova-white" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={!name.trim() || !birthDay || !birthMonth}
          onClick={() => {
            onConfigChange({ name: name.trim(), birthDate: formatBirthDate(birthMonth!, birthDay!), color });
            setEditing(false);
          }}
          className="rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-4 py-1.5 text-xs font-medium text-nova-white disabled:opacity-40"
        >
          Guardar
        </button>
      </WidgetCard>
    );
  }

  const daysRemaining = getDaysUntilNextBirthday(config.birthDate as string);

  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      className="items-center justify-center gap-1"
      style={{ background: `linear-gradient(150deg, ${vivid} 0%, ${pastel} 100%)` }}
    >
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="absolute right-3 top-3 text-nova-white/60 hover:text-nova-white"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-5 top-6 h-1.5 w-1.5 rounded-full bg-nova-white/70"
        animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.3, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute right-7 top-10 h-1 w-1 rounded-full bg-nova-white/60"
        animate={{ opacity: [0.25, 0.8, 0.25], scale: [1, 1.35, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-8 h-1 w-1 rounded-full bg-nova-white/60"
        animate={{ opacity: [0.3, 0.85, 0.3], scale: [1, 1.3, 1] }}
        transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <div className="h-[10px] w-[2.5px] rounded-full bg-nova-navy/20 sm:h-[17px] sm:w-[4px]" />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 -z-10 h-[26px] w-[26px] rounded-full sm:h-[45px] sm:w-[45px]"
          style={{ background: "radial-gradient(circle, rgba(253,224,71,0.6) 0%, rgba(253,224,71,0) 70%)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="-mt-[2px] h-[8px] w-[8px] rounded-full sm:-mt-[4px] sm:h-[14px] sm:w-[14px]"
          style={{ background: "radial-gradient(circle, #FEF3C7 0%, #FDE68A 45%, #F97316 100%)" }}
          animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.22, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="z-10 mt-[3px] flex h-[48px] w-[48px] flex-col items-center justify-center rounded-full border-2 border-nova-white bg-nova-white text-center shadow-[0_4px_14px_rgba(4,14,60,0.14)] sm:mt-[6px] sm:h-[82px] sm:w-[82px]">
          <AnimatedNumber value={daysRemaining} className="text-[18px] font-black leading-none text-nova-navy sm:text-[31px]" />
          <span className="text-[8px] font-medium uppercase tracking-wide text-nova-navy/40 sm:text-[13px]">días</span>
        </div>

        <div className="-mt-1 flex flex-col items-center sm:-mt-2">
          <div className="h-[15px] w-[48px] rounded-t-lg border border-nova-white/80 sm:h-[25px] sm:w-[82px]" style={{ backgroundColor: pastel }} />
          <div className="-mt-px flex gap-[3px] sm:gap-[5px]">
            {[0, 1, 2, 3].map((dot) => (
              <span
                key={dot}
                className="h-[6px] w-[6px] rounded-full border border-nova-white/80 sm:h-[11px] sm:w-[11px]"
                style={{ backgroundColor: pastel }}
              />
            ))}
          </div>
          <div className="h-[17px] w-[68px] border border-nova-white/80 sm:h-[29px] sm:w-[116px]" style={{ backgroundColor: `${pastel}D9` }} />
          <div
            className="relative flex h-[29px] w-[97px] items-center justify-center rounded-b-2xl border border-nova-white/80 sm:h-[50px] sm:w-[166px]"
            style={{ backgroundColor: `${pastel}B3` }}
          >
            <span className="max-w-[92%] truncate rounded-full bg-nova-white/90 px-2 py-0.5 text-[9px] font-semibold text-nova-navy shadow-sm sm:px-3 sm:py-1 sm:text-[13px]">
              {config.name}
            </span>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
