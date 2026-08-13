"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { COURSE_COLORS } from "@/lib/schedule/colors";
import type { Course } from "@/lib/schedule/types";

export function CourseEditor({
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  initial?: Course;
  onSave: (data: { name: string; color: string }) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? COURSE_COLORS[0].id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nova-navy/20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-3xl border border-nova-navy/5 bg-nova-white p-8 shadow-[0_20px_60px_-30px_rgba(4,14,60,0.35)]"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-nova-navy">
            {initial ? "Editar curso" : "Nuevo curso"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-nova-navy/40 hover:text-nova-navy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre del curso"
          className="w-full rounded-2xl border border-nova-navy/10 bg-nova-white px-4 py-2.5 text-sm text-nova-navy outline-none transition-colors focus:border-nova-electric"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {COURSE_COLORS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setColor(option.id)}
              aria-label={option.label}
              className="h-7 w-7 rounded-full transition-transform"
              style={{
                backgroundColor: option.hex,
                outline: color === option.id ? `2px solid ${option.hex}` : "none",
                outlineOffset: 2,
                transform: color === option.id ? "scale(1.1)" : "scale(1)",
              }}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            disabled={name.trim().length === 0}
            onClick={() => onSave({ name: name.trim(), color })}
            className="flex-1 rounded-full bg-gradient-to-r from-nova-electric to-nova-intermediate px-6 py-2.5 text-sm font-medium text-nova-white disabled:opacity-40"
          >
            Guardar
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
