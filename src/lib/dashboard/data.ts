"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  FIXED_WIDGET_IDS,
  type DashboardConfig,
  type Widget,
  type WidgetConfig,
  type WidgetType,
} from "@/lib/dashboard/types";

function dashboardConfigRef(uid: string) {
  return doc(db, "users", uid, "dashboard", "config");
}

export function widgetsCollectionRef(uid: string) {
  return collection(db, "users", uid, "dashboardWidgets");
}

export async function getDashboardConfig(uid: string): Promise<DashboardConfig> {
  const snapshot = await getDoc(dashboardConfigRef(uid));
  if (snapshot.exists()) return snapshot.data() as DashboardConfig;
  return { fixedOrder: [...FIXED_WIDGET_IDS] };
}

export async function saveFixedOrder(
  uid: string,
  fixedOrder: DashboardConfig["fixedOrder"]
): Promise<void> {
  await setDoc(dashboardConfigRef(uid), { fixedOrder }, { merge: true });
}

export async function getWidgets(uid: string): Promise<Widget[]> {
  const snapshot = await getDocs(widgetsCollectionRef(uid));
  return snapshot.docs
    .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Widget)
    .sort((a, b) => a.order - b.order);
}

export async function addWidget(
  uid: string,
  type: WidgetType,
  order: number
): Promise<Widget> {
  const now = Date.now();
  const data = {
    type,
    order,
    config: {} as WidgetConfig,
    variant: Math.floor(Math.random() * 5),
    createdAt: now,
    updatedAt: now,
  };
  const created = await addDoc(widgetsCollectionRef(uid), data);
  return { id: created.id, ...data };
}

export async function updateWidget(
  uid: string,
  widgetId: string,
  patch: Partial<Pick<Widget, "config" | "order">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "dashboardWidgets", widgetId), {
    ...patch,
    updatedAt: Date.now(),
  });
}

export async function removeWidget(uid: string, widgetId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "dashboardWidgets", widgetId));
}

export async function reorderWidgets(
  uid: string,
  orderedIds: string[]
): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((widgetId, index) => {
    batch.update(doc(db, "users", uid, "dashboardWidgets", widgetId), {
      order: index,
      updatedAt: Date.now(),
    });
  });
  await batch.commit();
}
