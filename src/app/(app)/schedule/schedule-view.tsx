"use client";

import { useEffect, useState } from "react";
import { getDoc, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  coursesCollectionRef,
  scheduleAssignmentsRef,
  scheduleConfigRef,
} from "@/lib/schedule/data";
import type { Course, ScheduleConfig } from "@/lib/schedule/types";
import { ScheduleOnboarding } from "@/app/(app)/schedule/schedule-onboarding";
import { ScheduleBoard } from "@/app/(app)/schedule/schedule-board";
import { getCachedView, setCachedView } from "@/lib/cache/view-cache";

type LoadedState =
  | { status: "loading" }
  | { status: "onboarding"; includeCoursesStep: boolean }
  | {
      status: "board";
      config: ScheduleConfig;
      courses: Course[];
      cells: Record<string, string>;
    };

type ResolvedState = Exclude<LoadedState, { status: "loading" }>;

export function ScheduleView() {
  const { user } = useAuth();
  const cacheKey = user ? `schedule:${user.uid}` : null;
  const cached = cacheKey ? getCachedView<ResolvedState>(cacheKey) : undefined;

  const [state, setState] = useState<LoadedState>(cached ?? { status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const [configSnapshot, coursesSnapshot] = await Promise.all([
        getDoc(scheduleConfigRef(user!.uid)),
        getDocs(coursesCollectionRef(user!.uid)),
      ]);
      if (cancelled) return;

      const courses = coursesSnapshot.docs.map(
        (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Course
      );

      if (!configSnapshot.exists()) {
        // First-time entry only — whether to ask for courses is driven by
        // whether the user already has any. The "Eliminar horario" fallback
        // below always sets this to false instead, since that trigger is its
        // own dedicated 3-step reconfiguration flow regardless of courses.
        const next: ResolvedState = { status: "onboarding", includeCoursesStep: courses.length === 0 };
        setState(next);
        setCachedView(`schedule:${user!.uid}`, next);
        return;
      }

      const assignmentsSnapshot = await getDoc(scheduleAssignmentsRef(user!.uid));
      if (cancelled) return;

      const next: ResolvedState = {
        status: "board",
        config: configSnapshot.data() as ScheduleConfig,
        courses,
        cells: (assignmentsSnapshot.data()?.cells ?? {}) as Record<string, string>,
      };
      setState(next);
      setCachedView(`schedule:${user!.uid}`, next);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  if (!user || state.status === "loading") {
    return <div className="p-10 text-sm text-nova-navy/40">Cargando…</div>;
  }

  if (state.status === "onboarding") {
    return (
      <ScheduleOnboarding
        uid={user.uid}
        includeCoursesStep={state.includeCoursesStep}
        onFinished={() => {
          setState({ status: "loading" });
          setReloadKey((key) => key + 1);
        }}
      />
    );
  }

  return (
    <ScheduleBoard
      uid={user.uid}
      config={state.config}
      initialCourses={state.courses}
      initialCells={state.cells}
      onScheduleDeleted={() => {
        const next: ResolvedState = { status: "onboarding", includeCoursesStep: false };
        setState(next);
        setCachedView(`schedule:${user.uid}`, next);
      }}
    />
  );
}
