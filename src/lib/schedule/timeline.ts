import type { Recreo, ScheduleConfig, TimelineRow } from "@/lib/schedule/types";

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatRange(startMinutes: number, endMinutes: number): string {
  return `${formatMinutesToTime(startMinutes)} – ${formatMinutesToTime(endMinutes)}`;
}

export function generateTimeline(
  config: Pick<ScheduleConfig, "startTime" | "blockCount" | "blockDurationMinutes" | "recreos">
): TimelineRow[] {
  const pendingRecreos = [...config.recreos]
    .map((recreo) => ({ ...recreo, startMinutes: parseTimeToMinutes(recreo.startTime) }))
    .sort((a, b) => a.startMinutes - b.startMinutes);

  const rows: TimelineRow[] = [];
  let current = parseTimeToMinutes(config.startTime);

  function placeDueRecreos() {
    while (pendingRecreos.length > 0 && current >= pendingRecreos[0].startMinutes) {
      const recreo = pendingRecreos.shift() as Recreo & { startMinutes: number };
      rows.push({
        type: "recreo",
        recreoId: recreo.id,
        startMinutes: current,
        endMinutes: current + recreo.durationMinutes,
      });
      current += recreo.durationMinutes;
    }
  }

  for (let blockIndex = 0; blockIndex < config.blockCount; blockIndex += 1) {
    placeDueRecreos();
    rows.push({
      type: "block",
      blockIndex,
      startMinutes: current,
      endMinutes: current + config.blockDurationMinutes,
    });
    current += config.blockDurationMinutes;
  }

  placeDueRecreos();
  while (pendingRecreos.length > 0) {
    const recreo = pendingRecreos.shift() as Recreo & { startMinutes: number };
    rows.push({
      type: "recreo",
      recreoId: recreo.id,
      startMinutes: current,
      endMinutes: current + recreo.durationMinutes,
    });
    current += recreo.durationMinutes;
  }

  return rows;
}
