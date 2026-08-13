"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Cake,
  GraduationCap,
  LoaderCircle,
  LogOut,
  PartyPopper,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { NumberFlowSlider } from "@/app/onboarding/number-flow-slider";
import { SelectDropdown } from "@/app/onboarding/select-dropdown";
import { OnboardingFlowBackground } from "@/app/onboarding-flow-background";
import { addWidget, updateWidget } from "@/lib/dashboard/data";
import { MONTH_OPTIONS, daysInMonth, formatBirthDate } from "@/lib/dashboard/birthday";
import type { EducationLevel } from "@/lib/users/types";

const MIN_AGE = 1;
const MAX_AGE = 50;
const DEFAULT_AGE = 10;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;
const TOTAL_STEPS = 6;

const EASE = [0.22, 1, 0.36, 1] as const;

const stepVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const continueButtonClass =
  "flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-6 py-3 text-sm font-medium text-nova-white transition-opacity disabled:opacity-40";

export function OnboardingView({
  initialName,
  initialAge,
}: {
  initialName: string;
  initialAge: number | null;
}) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState<number>(
    initialAge !== null ? clamp(initialAge, MIN_AGE, MAX_AGE) : DEFAULT_AGE
  );
  const [birthDay, setBirthDay] = useState<number | null>(null);
  const [birthMonth, setBirthMonth] = useState<number | null>(null);
  const [educationLevel, setEducationLevel] = useState<EducationLevel | null>(null);
  const [grade, setGrade] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleBirthdayContinue() {
    if (!birthDay || !birthMonth) return;
    setStep(4);
  }

  async function handleSaveDetails() {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/activate-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age,
          birthDate: birthMonth && birthDay ? formatBirthDate(birthMonth, birthDay) : null,
          educationLevel,
          grade,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar tu información.");
        setIsSubmitting(false);
        return;
      }
      setStep(6);
      setIsSubmitting(false);
    } catch {
      setError("No se pudo guardar tu información.");
      setIsSubmitting(false);
    }
  }

  async function handleFinish() {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo finalizar el onboarding.");
        setIsSubmitting(false);
        return;
      }

      // Seeds a Cumpleaños widget for the account holder's own birthday, so
      // the Dashboard isn't empty on first visit. This widget's birthDate is
      // its own independent copy (like any other Cumpleaños widget the user
      // might add later for someone else) — it starts equal to the profile's
      // birthDate because that's what was just entered, but editing this
      // widget afterward, or any other, must never write back to the
      // profile or to each other.
      if (user && birthMonth && birthDay) {
        try {
          const widget = await addWidget(user.uid, "cumpleanos", 0);
          await updateWidget(user.uid, widget.id, {
            config: {
              name: name.trim(),
              birthDate: formatBirthDate(birthMonth, birthDay),
              color: "rosado",
            },
          });
        } catch {
          // Non-critical: onboarding itself already succeeded above.
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("No se pudo finalizar el onboarding.");
      setIsSubmitting(false);
    }
  }

  const isAgeValid = age >= MIN_AGE && age <= MAX_AGE;
  const gradeOptions =
    educationLevel === "primaria" ? [1, 2, 3, 4, 5, 6] : educationLevel === "secundaria" ? [1, 2, 3, 4, 5] : [];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <OnboardingFlowBackground />

      <button
        type="button"
        onClick={() => signOut()}
        className="absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full border border-nova-navy/10 bg-nova-white px-4 py-2.5 text-sm font-medium text-nova-navy/60 shadow-[0_4px_16px_-6px_rgba(4,14,60,0.15)] transition-colors hover:bg-nova-navy/[0.03] hover:text-nova-navy"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        Cerrar sesión
      </button>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((dot) => (
            <motion.span
              key={dot}
              className="h-1.5 rounded-full"
              animate={{
                width: dot === step ? 22 : 8,
                backgroundColor: dot <= step ? "#0A6DFD" : "rgba(4,14,60,0.12)",
              }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-nova-navy/5 bg-nova-white p-10 shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <User className="h-6 w-6 text-nova-electric" strokeWidth={1.75} />
                  <h1 className="text-lg font-semibold text-nova-navy">¿Cómo te llamas?</h1>
                </div>
                <motion.input
                  layout
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-2xl border border-nova-navy/10 bg-nova-white px-4 py-3 text-center text-base text-nova-navy outline-none transition-colors focus:border-nova-electric"
                />
                <button
                  type="button"
                  disabled={name.trim().length === 0}
                  onClick={() => setStep(2)}
                  className={continueButtonClass}
                >
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-lg font-semibold text-nova-navy">¿Cuántos años tienes?</h1>
                </div>
                <NumberFlowSlider value={age} min={MIN_AGE} max={MAX_AGE} onChange={setAge} />
                <button type="button" disabled={!isAgeValid} onClick={() => setStep(3)} className={continueButtonClass}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <Cake className="h-6 w-6 text-nova-electric" strokeWidth={1.75} />
                  <h1 className="text-lg font-semibold text-nova-navy">¿Cuándo cumples años?</h1>
                </div>
                <motion.div layout className="flex gap-3">
                  <SelectDropdown
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
                </motion.div>
                <button
                  type="button"
                  disabled={!birthDay || !birthMonth}
                  onClick={handleBirthdayContinue}
                  className={continueButtonClass}
                >
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <GraduationCap className="h-6 w-6 text-nova-electric" strokeWidth={1.75} />
                  <h1 className="text-lg font-semibold text-nova-navy">¿En qué nivel estás?</h1>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { id: "primaria", label: "Primaria" },
                      { id: "secundaria", label: "Secundaria" },
                    ] as const
                  ).map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => {
                        setEducationLevel(level.id);
                        setGrade(1);
                      }}
                      className={`rounded-2xl border px-4 py-5 text-sm font-semibold transition-colors ${
                        educationLevel === level.id
                          ? "border-nova-electric bg-nova-electric/10 text-nova-electric"
                          : "border-nova-navy/10 text-nova-navy/60 hover:border-nova-navy/20"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
                <button type="button" disabled={!educationLevel} onClick={() => setStep(5)} className={continueButtonClass}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-lg font-semibold text-nova-navy">¿En qué grado estás?</h1>
                  <p className="text-sm text-nova-navy/50">
                    {educationLevel === "primaria" ? "Primaria" : "Secundaria"}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {gradeOptions.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-colors ${
                        grade === g
                          ? "border-nova-electric bg-nova-electric/10 text-nova-electric"
                          : "border-nova-navy/10 text-nova-navy/60 hover:border-nova-navy/20"
                      }`}
                    >
                      {g}.°
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!grade || isSubmitting}
                  onClick={handleSaveDetails}
                  className={continueButtonClass.replace("disabled:opacity-40", "disabled:opacity-60")}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continuar <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step-6"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col items-center gap-6 text-center"
              >
                <PartyPopper className="h-8 w-8 text-nova-electric" strokeWidth={1.75} />
                <div className="flex flex-col gap-1">
                  <h1 className="text-lg font-semibold text-nova-navy">Bienvenido, {name.trim() || "a NovaClass"}</h1>
                  <p className="text-sm text-nova-navy/50">
                    Tu cuenta está lista. Configuremos tu horario y tus cursos.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinish}
                  className={continueButtonClass.replace("disabled:opacity-40", "disabled:opacity-60")}
                >
                  {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Comenzar"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </div>
      </div>
    </main>
  );
}
