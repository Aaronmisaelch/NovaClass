"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Pencil } from "lucide-react";
import { AnimatedNumber } from "@/app/(app)/dashboard/animated-number";
import { NumberFlowSlider } from "@/app/onboarding/number-flow-slider";
import { SelectDropdown } from "@/app/onboarding/select-dropdown";
import {
  MONTH_OPTIONS,
  daysInMonth,
  formatBirthDate,
  parseBirthDate,
} from "@/lib/dashboard/birthday";
import type { EducationLevel } from "@/lib/users/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const CARD_SHADOW =
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_1px_2px_-1px_rgba(4,14,60,0.06),0_18px_40px_-22px_rgba(4,14,60,0.18)]";

const MIN_AGE = 1;
const MAX_AGE = 50;

// All three cards edit the same real account data saved during onboarding
// (users/{uid}.age / .birthDate / .educationLevel / .grade) — this posts a
// partial patch and lets each card update its own local "saved" value on
// success, no page reload needed.
async function saveProfileField(patch: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function InfoCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`relative flex min-h-[190px] flex-col overflow-hidden rounded-3xl border border-nova-navy/[0.04] bg-nova-white p-6 ${CARD_SHADOW} ${className}`}
    >
      {children}
    </motion.div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Editar"
      className="absolute right-3 top-3 text-nova-navy/30 transition-colors hover:text-nova-navy/60"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}

function EditActions({
  onCancel,
  onSave,
  saving,
  disabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  disabled: boolean;
}) {
  return (
    <div className="mt-1 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full px-4 py-1.5 text-xs font-medium text-nova-navy/50 transition-colors hover:bg-nova-navy/[0.04]"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled || saving}
        className="rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-4 py-1.5 text-xs font-medium text-nova-white disabled:opacity-40"
      >
        {saving ? "Guardando…" : "Guardar"}
      </button>
    </div>
  );
}

function AgeCard({ age: initialAge }: { age: number | null }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [age, setAge] = useState(initialAge);
  const [draftAge, setDraftAge] = useState(initialAge ?? 10);

  async function handleSave() {
    setSaving(true);
    const ok = await saveProfileField({ age: draftAge });
    setSaving(false);
    if (ok) {
      setAge(draftAge);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <InfoCard className="items-center justify-center gap-3 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-nova-navy/35">Edad</span>
        <div className="w-full px-2">
          <NumberFlowSlider value={draftAge} min={MIN_AGE} max={MAX_AGE} onChange={setDraftAge} />
        </div>
        <EditActions
          onCancel={() => setEditing(false)}
          onSave={handleSave}
          saving={saving}
          disabled={false}
        />
      </InfoCard>
    );
  }

  return (
    <InfoCard className="items-center justify-center text-center">
      <EditButton
        onClick={() => {
          setDraftAge(age ?? 10);
          setEditing(true);
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(10,109,253,0.14) 0%, rgba(10,109,253,0) 70%)" }}
      />
      <span className="text-xs font-semibold uppercase tracking-wide text-nova-navy/35">Edad</span>
      {age !== null ? (
        <>
          <div className="relative mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-nova-electric to-nova-sky text-nova-white shadow-[0_10px_24px_-8px_rgba(10,109,253,0.55)]">
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-2 border-nova-white/30"
              animate={{ scale: [1, 1.14, 1], opacity: [0.6, 0.1, 0.6] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <AnimatedNumber value={age} className="text-3xl font-black leading-none" />
          </div>
          <p className="mt-3 text-xs text-nova-navy/40">años cumplidos</p>
        </>
      ) : (
        <p className="mt-4 text-sm text-nova-navy/40">Sin configurar</p>
      )}
    </InfoCard>
  );
}

function BirthdayCard({ birthDate: initialBirthDate }: { birthDate: string | null }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const initialParsed = birthDate ? parseBirthDate(birthDate) : null;
  const [draftDay, setDraftDay] = useState<number | null>(initialParsed?.day ?? null);
  const [draftMonth, setDraftMonth] = useState<number | null>(initialParsed?.month ?? null);

  const parsed = birthDate ? parseBirthDate(birthDate) : null;
  const monthLabel = parsed ? (MONTH_OPTIONS[parsed.month - 1]?.label ?? "") : "";

  async function handleSave() {
    if (!draftDay || !draftMonth) return;
    setSaving(true);
    const nextBirthDate = formatBirthDate(draftMonth, draftDay);
    const ok = await saveProfileField({ birthDate: nextBirthDate });
    setSaving(false);
    if (ok) {
      setBirthDate(nextBirthDate);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <InfoCard className="items-center justify-center gap-3 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-nova-navy/35">Cumpleaños</span>
        <div className="flex w-full gap-2">
          <SelectDropdown
            size="sm"
            value={draftDay}
            placeholder="Día"
            className="flex-1"
            options={Array.from({ length: draftMonth ? daysInMonth(draftMonth) : 31 }, (_, i) => ({
              value: i + 1,
              label: String(i + 1),
            }))}
            onChange={(day) => setDraftDay(day)}
          />
          <SelectDropdown
            size="sm"
            value={draftMonth}
            placeholder="Mes"
            className="flex-[1.4]"
            options={MONTH_OPTIONS}
            onChange={(month) => {
              setDraftMonth(month);
              if (draftDay && draftDay > daysInMonth(month)) {
                setDraftDay(daysInMonth(month));
              }
            }}
          />
        </div>
        <EditActions
          onCancel={() => setEditing(false)}
          onSave={handleSave}
          saving={saving}
          disabled={!draftDay || !draftMonth}
        />
      </InfoCard>
    );
  }

  return (
    <InfoCard className="items-center justify-center text-center">
      <EditButton
        onClick={() => {
          setDraftDay(parsed?.day ?? null);
          setDraftMonth(parsed?.month ?? null);
          setEditing(true);
        }}
      />
      <span className="text-xs font-semibold uppercase tracking-wide text-nova-navy/35">Cumpleaños</span>
      {parsed ? (
        <div className="relative mt-4 w-24 overflow-hidden rounded-2xl border border-nova-navy/10 shadow-[0_10px_24px_-14px_rgba(4,14,60,0.4)]">
          <div className="bg-gradient-to-r from-nova-intermediate to-nova-sky px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-nova-white">
            {monthLabel.slice(0, 3)}
          </div>
          <div className="flex items-center justify-center bg-nova-white py-3.5">
            <span className="text-3xl font-black text-nova-navy">{parsed.day}</span>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-nova-navy/40">Sin configurar</p>
      )}
    </InfoCard>
  );
}

const EDUCATION_LEVELS = [
  { id: "primaria" as const, label: "Primaria" },
  { id: "secundaria" as const, label: "Secundaria" },
];

function gradeOptionsFor(level: EducationLevel | null): number[] {
  if (level === "primaria") return [1, 2, 3, 4, 5, 6];
  if (level === "secundaria") return [1, 2, 3, 4, 5];
  return [];
}

function GradeCard({
  educationLevel: initialLevel,
  grade: initialGrade,
}: {
  educationLevel: EducationLevel | null;
  grade: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [educationLevel, setEducationLevel] = useState(initialLevel);
  const [grade, setGrade] = useState(initialGrade);
  const [draftLevel, setDraftLevel] = useState(initialLevel);
  const [draftGrade, setDraftGrade] = useState(initialGrade);

  const maxGrade = educationLevel === "primaria" ? 6 : 5;
  const levelLabel =
    educationLevel === "primaria" ? "Primaria" : educationLevel === "secundaria" ? "Secundaria" : null;

  async function handleSave() {
    if (!draftLevel || !draftGrade) return;
    setSaving(true);
    const ok = await saveProfileField({ educationLevel: draftLevel, grade: draftGrade });
    setSaving(false);
    if (ok) {
      setEducationLevel(draftLevel);
      setGrade(draftGrade);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <InfoCard className="justify-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-nova-navy/35">Grado y nivel</span>
        <div className="grid grid-cols-2 gap-2">
          {EDUCATION_LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => {
                setDraftLevel(level.id);
                setDraftGrade(1);
              }}
              className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                draftLevel === level.id
                  ? "border-nova-electric bg-nova-electric/10 text-nova-electric"
                  : "border-nova-navy/10 text-nova-navy/60 hover:border-nova-navy/20"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {gradeOptionsFor(draftLevel).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setDraftGrade(g)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                draftGrade === g
                  ? "border-nova-electric bg-nova-electric/10 text-nova-electric"
                  : "border-nova-navy/10 text-nova-navy/60 hover:border-nova-navy/20"
              }`}
            >
              {g}.°
            </button>
          ))}
        </div>
        <EditActions
          onCancel={() => setEditing(false)}
          onSave={handleSave}
          saving={saving}
          disabled={!draftLevel || !draftGrade}
        />
      </InfoCard>
    );
  }

  return (
    <InfoCard className="justify-center">
      <EditButton
        onClick={() => {
          setDraftLevel(educationLevel);
          setDraftGrade(grade);
          setEditing(true);
        }}
      />
      <span className="text-xs font-semibold uppercase tracking-wide text-nova-navy/35">Grado y nivel</span>
      {levelLabel && grade ? (
        <>
          <div className="mt-4 flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nova-electric/15 to-nova-sky/10 text-nova-electric">
              <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <p className="text-xl font-bold text-nova-navy">
              {grade}.° <span className="font-medium text-nova-navy/60">de {levelLabel}</span>
            </p>
          </div>
          <div className="mt-5 flex gap-1.5">
            {Array.from({ length: maxGrade }, (_, i) => i + 1).map((step) => (
              <span
                key={step}
                className={`h-1.5 flex-1 rounded-full ${step <= grade ? "bg-nova-electric" : "bg-nova-navy/10"}`}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-nova-navy/40">Sin configurar</p>
      )}
    </InfoCard>
  );
}

export function ProfileInfoCards({
  age,
  birthDate,
  educationLevel,
  grade,
}: {
  age: number | null;
  birthDate: string | null;
  educationLevel: EducationLevel | null;
  grade: number | null;
}) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <AgeCard age={age} />
      <BirthdayCard birthDate={birthDate} />
      <GradeCard educationLevel={educationLevel} grade={grade} />
    </div>
  );
}
