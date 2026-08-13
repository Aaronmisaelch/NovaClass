export const FIXED_WIDGET_IDS = [
  "clasesHoy",
  "tareasPendientes",
  "rendimientoMensual",
] as const;

export type FixedWidgetId = (typeof FIXED_WIDGET_IDS)[number];

export interface DashboardConfig {
  fixedOrder: FixedWidgetId[];
}

export type WidgetType =
  | "hora"
  | "fecha"
  | "countdown"
  | "cumpleanos"
  | "coleccionCursos"
  | "termometroMes"
  | "resumenTareas";

export interface WidgetTypeInfo {
  type: WidgetType;
  label: string;
}

export const WIDGET_TYPES: WidgetTypeInfo[] = [
  { type: "hora", label: "Hora" },
  { type: "fecha", label: "Fecha" },
  { type: "countdown", label: "Countdown" },
  { type: "cumpleanos", label: "Cumpleaños" },
  { type: "coleccionCursos", label: "Colección de cursos" },
  { type: "termometroMes", label: "Termómetro del mes" },
  { type: "resumenTareas", label: "Resumen de tareas" },
];

export interface ClockConfig {
  format: "12" | "24";
}

export interface CountdownConfig {
  title: string;
  targetDate: string;
}

export type BirthdayColor = "rosado" | "azul" | "celeste" | "verde" | "amarillo" | "rojo";

export interface BirthdayColorInfo {
  id: BirthdayColor;
  label: string;
}

export const BIRTHDAY_COLORS: BirthdayColorInfo[] = [
  { id: "rosado", label: "Rosado" },
  { id: "azul", label: "Azul" },
  { id: "celeste", label: "Celeste" },
  { id: "verde", label: "Verde" },
  { id: "amarillo", label: "Amarillo" },
  { id: "rojo", label: "Rojo" },
];

// Each Cumpleaños widget is its own independent card — a user can add
// several (their own, a friend's, ...) and each one's date lives only in
// that widget's own config, fully isolated from every other widget and from
// UserProfile.birthDate (the account's own real birthday, edited only from
// Perfil/onboarding). Editing or removing one widget must never touch any
// other widget's date, nor the profile's.
export interface BirthdayConfig {
  name: string;
  birthDate: string;
  color?: BirthdayColor;
}

export type WidgetConfig =
  | ClockConfig
  | CountdownConfig
  | BirthdayConfig
  | Record<string, never>;

export interface Widget {
  id: string;
  type: WidgetType;
  order: number;
  config: WidgetConfig;
  variant: number;
  createdAt: number;
  updatedAt: number;
}
