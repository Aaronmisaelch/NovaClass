"use client";

import { motion } from "framer-motion";
import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { WidgetCard } from "@/app/(app)/dashboard/widget-card";
import type { Task } from "@/lib/tasks/types";
import { getWeeklyPerformance } from "@/lib/dashboard/stats";

const IDLE_BAR_HEIGHTS = [10, 18, 13, 22, 15];

export function MonthlyPerformanceWidget({
  tasks,
  dragHandleProps,
}: {
  tasks: Task[];
  dragHandleProps?: Record<string, unknown>;
}) {
  const buckets = getWeeklyPerformance(tasks);
  const total = buckets.reduce((sum, value) => sum + value, 0);
  const data = buckets.map((value, index) => ({
    week: `S${index + 1}`,
    value,
  }));

  return (
    <WidgetCard dragHandleProps={dragHandleProps}>
      <p className="mb-1 text-[15px] font-medium text-nova-navy">Rendimiento mensual</p>
      <p className="mb-4 text-[13px] text-nova-navy/40">Tareas completadas este mes</p>

      {total === 0 ? (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-4 text-center">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute h-32 w-40 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(87,185,253,0.16) 0%, rgba(87,185,253,0) 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative flex h-12 items-end gap-2">
            {IDLE_BAR_HEIGHTS.map((height, index) => (
              <motion.span
                key={index}
                className="w-2.5 rounded-full"
                style={{
                  height,
                  background: "linear-gradient(180deg, #0A6DFD 0%, #57B9FD 100%)",
                  opacity: 0.22,
                }}
                animate={{ height: [height, height + 8, height], opacity: [0.22, 0.4, 0.22] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.15,
                }}
              />
            ))}
          </div>
          <div className="relative">
            <p className="text-[15px] font-bold text-nova-navy">Aún no hay actividad este mes</p>
            <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-nova-navy/40">
              Cuando completes tareas, tu progreso semana a semana aparecerá aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-36 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
              barCategoryGap="32%"
            >
              <defs>
                <linearGradient id="novaBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A6DFD" />
                  <stop offset="55%" stopColor="#2F94FD" />
                  <stop offset="100%" stopColor="#57B9FD" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#040E3C66", fontSize: 12, fontWeight: 500 }}
                dy={6}
              />
              <Tooltip
                cursor={{ fill: "rgba(4,14,60,0.03)", radius: 10 }}
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid rgba(4,14,60,0.06)",
                  boxShadow: "0 12px 28px -14px rgba(4,14,60,0.25)",
                  fontSize: 13,
                }}
              />
              <Bar
                dataKey="value"
                fill="url(#novaBarGradient)"
                radius={[10, 10, 10, 10]}
                maxBarSize={20}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#040E3C"
                strokeWidth={2}
                dot={{ r: 3.5, fill: "#040E3C", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </WidgetCard>
  );
}
