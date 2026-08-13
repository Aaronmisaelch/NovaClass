"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { CircleCheckBig } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import { AnimatedNumber } from "@/app/(app)/dashboard/animated-number";
import type { Task } from "@/lib/tasks/types";
import { getTaskCounts } from "@/lib/dashboard/stats";

const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const COLORS = {
  pendiente: "#57B9FD",
  enProgreso: "#0A6DFD",
};

export function PendingTasksWidget({
  tasks,
  dragHandleProps,
}: {
  tasks: Task[];
  dragHandleProps?: Record<string, unknown>;
}) {
  const gradientId = useId();
  const { pendiente, enProgreso } = getTaskCounts(tasks);
  const total = pendiente + enProgreso;

  const data = [
    { name: "Pendientes", value: pendiente, color: COLORS.pendiente },
    { name: "En progreso", value: enProgreso, color: COLORS.enProgreso },
  ];

  return (
    <WidgetCard dragHandleProps={dragHandleProps} className="items-center">
      <div className="flex w-full items-baseline justify-between">
        <p className="text-[15px] font-medium text-nova-navy">Tareas pendientes</p>
        <p className="text-xs text-nova-navy/35">Activas</p>
      </div>

      {total === 0 ? (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-4 text-center">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute h-32 w-32 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(10,109,253,0.16) 0%, rgba(10,109,253,0) 70%)" }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute right-6 top-3 h-1.5 w-1.5 rounded-full bg-nova-sky/60"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute bottom-4 left-7 h-1 w-1 rounded-full bg-nova-electric/50"
            animate={{ y: [0, 5, 0], opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0A6DFD" />
                  <stop offset="100%" stopColor="#57B9FD" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r={RING_RADIUS} fill="none" stroke="rgba(10,109,253,0.08)" strokeWidth="6" />
              <motion.circle
                cx="40"
                cy="40"
                r={RING_RADIUS}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <CircleCheckBig className="relative h-7 w-7 text-nova-electric" strokeWidth={1.75} />
            </motion.div>
          </div>
          <div className="relative">
            <p className="text-[15px] font-bold text-nova-navy">Todo despejado</p>
            <p className="mt-1 max-w-[13rem] text-xs leading-relaxed text-nova-navy/40">
              No tienes tareas activas — momento perfecto para respirar.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex w-full flex-1 items-center justify-center">
            <div className="relative aspect-square w-full max-w-[15rem]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="96%"
                    cornerRadius={16}
                    paddingAngle={5}
                    stroke="none"
                    isAnimationActive
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} fillOpacity={0.95} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <AnimatedNumber
                  value={total}
                  className="text-[61px] font-black leading-none tracking-tight text-nova-navy"
                />
                <span className="mt-2 text-xs font-medium uppercase tracking-wide text-nova-navy/35">
                  tareas activas
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-5">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[13px] font-semibold text-nova-navy">{entry.value}</span>
                <span className="text-xs text-nova-navy/40">{entry.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </WidgetCard>
  );
}
