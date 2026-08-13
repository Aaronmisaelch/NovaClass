"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  Clock,
  Coffee,
  KeyRound,
  Palette,
  Plus,
  Rows3,
  X,
  type LucideIcon,
} from "lucide-react";
import { createSchedule, addCourse, deleteCourse } from "@/lib/schedule/data";
import { NumberFlowSlider } from "@/app/onboarding/number-flow-slider";
import {
  COURSE_COLORS,
  DEFAULT_COURSE_COLOR,
  getCourseStyle,
} from "@/lib/schedule/colors";
import type { Course, Recreo } from "@/lib/schedule/types";
import { ImportScheduleModal } from "@/app/(app)/schedule/import-schedule-modal";
import { TimePickerPopover } from "@/app/(app)/time-picker-popover";

type Step = 0 | 1 | 2 | 3 | 4;

const EASE = [0.22, 1, 0.36, 1] as const;

const stepVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const continueButtonClass =
  "flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-6 py-3 text-sm font-medium text-nova-white disabled:opacity-40";

function newRecreo(index: number): Recreo {
  return {
    id: crypto.randomUUID(),
    startTime: index === 0 ? "10:00" : "12:00",
    durationMinutes: 20,
  };
}

function StepHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nova-electric/15 to-nova-sky/10">
        <Icon className="h-7 w-7 text-nova-electric" strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-nova-navy">{title}</h1>
        {description && <p className="text-sm text-nova-navy/50">{description}</p>}
      </div>
    </div>
  );
}

function RecreoRow({
  recreo,
  index,
  onChange,
}: {
  recreo: Recreo;
  index: number;
  onChange: (patch: Partial<Recreo>) => void;
}) {
  const [timeOpen, setTimeOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex items-center gap-2.5 rounded-2xl border border-nova-navy/10 p-3"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nova-electric/10 text-[11px] font-bold text-nova-electric">
        {index + 1}
      </span>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setTimeOpen((value) => !value)}
        className="flex flex-1 items-center gap-1.5 rounded-xl border border-nova-navy/10 px-2.5 py-1.5 text-sm font-medium text-nova-navy outline-none transition-colors hover:border-nova-electric/40"
      >
        <Clock className="h-3.5 w-3.5 shrink-0 text-nova-navy/30" strokeWidth={1.75} />
        {recreo.startTime}
      </button>
      <TimePickerPopover
        open={timeOpen}
        onClose={() => setTimeOpen(false)}
        triggerRef={triggerRef}
        value={recreo.startTime}
        onChange={(time) => onChange({ startTime: time })}
      />

      <input
        type="number"
        min={5}
        max={60}
        value={recreo.durationMinutes}
        onChange={(event) => onChange({ durationMinutes: Number(event.target.value) })}
        className="w-14 shrink-0 rounded-xl border border-nova-navy/10 px-2 py-1.5 text-center text-sm text-nova-navy outline-none focus:border-nova-electric"
      />
      <span className="shrink-0 text-xs text-nova-navy/40">min</span>
    </motion.div>
  );
}

// Shared by two triggers with deliberately different shapes:
// - The first time a user ever opens the Schedule module (includeCoursesStep
//   is normally true, since they have no courses yet): "Crear tu horario"
//   runs all 4 steps through adding courses.
// - ScheduleView's fallback after "Eliminar horario" (always
//   includeCoursesStep=false — deleting the schedule never touches courses,
//   see deleteSchedule in lib/schedule/data.ts): "Crear tu horario" is a
//   dedicated 3-step reconfiguration flow (hora, bloques, recreos) with no
//   course step, since the user's existing courses are untouched and just
//   need to be dragged back onto the new grid.
// Both triggers always start at the same step-0 Importar/Crear choice —
// only the length of the "Crear tu horario" path differs.
export function ScheduleOnboarding({
  uid,
  includeCoursesStep,
  onFinished,
}: {
  uid: string;
  includeCoursesStep: boolean;
  onFinished: () => void;
}) {
  const totalSteps = includeCoursesStep ? 4 : 3;
  const [step, setStep] = useState<Step>(0);
  const [importOpen, setImportOpen] = useState(false);
  const [startTime, setStartTime] = useState("07:30");
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const startTimeTriggerRef = useRef<HTMLButtonElement>(null);
  const [blockCount, setBlockCount] = useState(8);
  const [blockDuration, setBlockDuration] = useState(45);
  const [recreoCount, setRecreoCount] = useState(1);
  const [recreos, setRecreos] = useState<Recreo[]>([newRecreo(0)]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseName, setCourseName] = useState("");
  const [courseColor, setCourseColor] = useState(DEFAULT_COURSE_COLOR);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRecreoCount(count: number) {
    const clamped = Math.max(0, Math.min(5, count));
    setRecreoCount(clamped);
    setRecreos((current) => {
      if (clamped > current.length) {
        return [
          ...current,
          ...Array.from({ length: clamped - current.length }, (_, i) =>
            newRecreo(current.length + i)
          ),
        ];
      }
      return current.slice(0, clamped);
    });
  }

  function updateRecreo(id: string, patch: Partial<Recreo>) {
    setRecreos((current) =>
      current.map((recreo) => (recreo.id === id ? { ...recreo, ...patch } : recreo))
    );
  }

  async function handleCreateSchedule() {
    setError(null);
    setIsSubmitting(true);
    try {
      await createSchedule(uid, {
        startTime,
        blockCount,
        blockDurationMinutes: blockDuration,
        recreos,
      });
      if (includeCoursesStep) {
        setStep(4);
      } else {
        onFinished();
      }
    } catch {
      setError("No se pudo crear el horario. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddCourse() {
    const trimmed = courseName.trim();
    if (!trimmed) return;
    setError(null);
    try {
      const id = await addCourse(uid, { name: trimmed, color: courseColor });
      setCourses((current) => [
        ...current,
        { id, name: trimmed, color: courseColor, createdAt: Date.now() },
      ]);
      setCourseName("");
    } catch {
      setError("No se pudo agregar el curso.");
    }
  }

  async function handleRemoveCourse(courseId: string) {
    setCourses((current) => current.filter((course) => course.id !== courseId));
    try {
      await deleteCourse(uid, courseId);
    } catch {
      setError("No se pudo eliminar el curso.");
    }
  }

  return (
    <main className="relative flex justify-center p-10">
      <div className="w-full max-w-md py-6">
        {step > 0 && (
          <div className="relative mb-6 flex items-center justify-center gap-2">
            <motion.button
              type="button"
              onClick={() => setStep(0)}
              aria-label="Volver a la elección"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.15, ease: EASE }}
              className="absolute left-0 flex h-7 w-7 items-center justify-center rounded-full text-nova-navy/40 transition-colors hover:bg-nova-navy/[0.06] hover:text-nova-navy"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </motion.button>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((dot) => (
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
        )}

        <div className="overflow-hidden rounded-3xl border border-nova-navy/5 bg-nova-white p-10 shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col gap-6"
              >
                <StepHeader
                  icon={CalendarClock}
                  title="Configura tu horario"
                  description="¿Tienes el código de un compañero con el mismo horario o prefieres armarlo tú mismo?"
                />

                <div className="flex flex-col gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="group flex items-center gap-4 rounded-2xl border border-nova-navy/10 p-4 text-left transition-colors hover:border-nova-electric/30 hover:bg-nova-electric/[0.03]"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nova-electric to-nova-intermediate text-nova-white shadow-[0_8px_20px_-8px_rgba(10,109,253,0.5)]">
                      <CalendarPlus className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-nova-navy">Crear tu horario</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-nova-navy/45">
                        Configura tu hora de inicio, bloques y recreos desde cero.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-nova-navy/20 transition-all group-hover:translate-x-0.5 group-hover:text-nova-electric" />
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setImportOpen(true)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="group flex items-center gap-4 rounded-2xl border border-nova-navy/10 p-4 text-left transition-colors hover:border-nova-electric/30 hover:bg-nova-navy/[0.02]"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-nova-electric/10 text-nova-electric">
                      <KeyRound className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-nova-navy">Importar horario</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-nova-navy/45">
                        Usa un código de 6 dígitos para copiar el horario de un compañero.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-nova-navy/20 transition-all group-hover:translate-x-0.5 group-hover:text-nova-electric" />
                  </motion.button>
                </div>
              </motion.div>
            )}

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
                <StepHeader icon={Clock} title="¿A qué hora empieza tu jornada?" />

                <button
                  ref={startTimeTriggerRef}
                  type="button"
                  onClick={() => setStartTimeOpen((value) => !value)}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-nova-navy/10 bg-nova-white px-4 py-3.5 text-lg font-semibold tabular-nums text-nova-navy outline-none transition-colors hover:border-nova-electric/40"
                >
                  <Clock className="h-5 w-5 text-nova-electric/50" strokeWidth={1.75} />
                  {startTime}
                </button>
                <TimePickerPopover
                  open={startTimeOpen}
                  onClose={() => setStartTimeOpen(false)}
                  triggerRef={startTimeTriggerRef}
                  value={startTime}
                  onChange={setStartTime}
                />

                <button type="button" onClick={() => setStep(2)} className={continueButtonClass}>
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
                <StepHeader
                  icon={Rows3}
                  title="Bloques de clase"
                  description="Define cuántos bloques tiene tu día y cuánto dura cada uno."
                />

                <div className="flex flex-col gap-3 rounded-2xl border border-nova-navy/10 p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-nova-navy/40">
                    Cantidad de bloques por día
                  </span>
                  <NumberFlowSlider value={blockCount} min={1} max={15} onChange={setBlockCount} />
                </div>

                <label className="flex flex-col gap-3 rounded-2xl border border-nova-navy/10 p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-nova-navy/40">
                    Duración de cada bloque
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={15}
                      max={180}
                      step={5}
                      value={blockDuration}
                      onChange={(event) => setBlockDuration(Number(event.target.value))}
                      className="w-full rounded-xl border border-nova-navy/10 bg-nova-white px-4 py-2.5 text-center text-lg font-semibold tabular-nums text-nova-navy outline-none transition-colors focus:border-nova-electric"
                    />
                    <span className="shrink-0 text-sm font-medium text-nova-navy/40">min</span>
                  </div>
                </label>

                <button
                  type="button"
                  disabled={blockCount < 1 || blockDuration < 5}
                  onClick={() => setStep(3)}
                  className={continueButtonClass}
                >
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
                <StepHeader icon={Coffee} title="Recreos" description="¿Cuántos recreos y a qué hora?" />

                <label className="flex flex-col gap-3 rounded-2xl border border-nova-navy/10 p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-nova-navy/40">
                    Cantidad de recreos
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={recreoCount}
                    onChange={(event) => updateRecreoCount(Number(event.target.value))}
                    className="w-full rounded-xl border border-nova-navy/10 bg-nova-white px-4 py-2.5 text-center text-lg font-semibold tabular-nums text-nova-navy outline-none transition-colors focus:border-nova-electric"
                  />
                </label>

                <motion.div layout className="flex flex-col gap-3">
                  {recreos.map((recreo, index) => (
                    <RecreoRow
                      key={recreo.id}
                      recreo={recreo}
                      index={index}
                      onChange={(patch) => updateRecreo(recreo.id, patch)}
                    />
                  ))}
                </motion.div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateSchedule}
                  className={continueButtonClass.replace("disabled:opacity-40", "disabled:opacity-60")}
                >
                  {isSubmitting
                    ? "Guardando..."
                    : includeCoursesStep
                      ? "Continuar"
                      : "Guardar horario"}
                  {!isSubmitting && includeCoursesStep && <ArrowRight className="h-4 w-4" />}
                </button>
              </motion.div>
            )}

            {step === 4 && includeCoursesStep && (
              <motion.div
                key="step-4"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col gap-6"
              >
                <StepHeader
                  icon={Palette}
                  title="Agrega tus cursos"
                  description="Puedes agregar más cursos cuando quieras."
                />

                <div className="flex flex-wrap justify-center gap-2">
                  {COURSE_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setCourseColor(color.id)}
                      aria-label={color.label}
                      className="h-7 w-7 rounded-full transition-transform"
                      style={{
                        backgroundColor: color.hex,
                        outline:
                          courseColor === color.id
                            ? `2px solid ${color.hex}`
                            : "none",
                        outlineOffset: 2,
                        transform: courseColor === color.id ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={courseName}
                    onChange={(event) => setCourseName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleAddCourse();
                    }}
                    placeholder="Nombre del curso"
                    className="flex-1 rounded-2xl border border-nova-navy/10 bg-nova-white px-4 py-2.5 text-sm text-nova-navy outline-none transition-colors focus:border-nova-electric"
                  />
                  <button
                    type="button"
                    onClick={handleAddCourse}
                    disabled={courseName.trim().length === 0}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nova-navy/5 text-nova-navy transition-colors hover:bg-nova-navy/10 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <motion.div layout className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {courses.map((course) => (
                      <motion.span
                        key={course.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        style={getCourseStyle(course.color)}
                        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
                      >
                        {course.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(course.id)}
                          className="opacity-60 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </motion.div>

                <button type="button" onClick={onFinished} className={continueButtonClass}>
                  Ir a mi horario <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {importOpen && (
          <ImportScheduleModal
            uid={uid}
            onImported={() => {
              setImportOpen(false);
              onFinished();
            }}
            onClose={() => setImportOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
