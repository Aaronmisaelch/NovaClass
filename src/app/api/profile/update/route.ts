import { getSessionUser } from "@/lib/auth/session";
import { getUserProfile, invalidateUserProfileCache, updateProfileDetails } from "@/lib/users/profile";
import { isValidBirthDate } from "@/lib/dashboard/birthday";
import type { EducationLevel } from "@/lib/users/types";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const patch: {
    age?: number;
    birthDate?: string;
    educationLevel?: EducationLevel;
    grade?: number;
  } = {};

  if (body.age !== undefined) {
    if (typeof body.age !== "number" || body.age < 1 || body.age > 50) {
      return Response.json({ error: "La edad debe estar entre 1 y 50." }, { status: 400 });
    }
    patch.age = body.age;
  }

  if (body.birthDate !== undefined) {
    if (typeof body.birthDate !== "string" || !isValidBirthDate(body.birthDate)) {
      return Response.json({ error: "La fecha de cumpleaños no es válida." }, { status: 400 });
    }
    patch.birthDate = body.birthDate;
  }

  if (body.educationLevel !== undefined) {
    if (body.educationLevel !== "primaria" && body.educationLevel !== "secundaria") {
      return Response.json({ error: "El nivel educativo no es válido." }, { status: 400 });
    }
    patch.educationLevel = body.educationLevel;
  }

  if (body.grade !== undefined) {
    if (typeof body.grade !== "number") {
      return Response.json({ error: "El grado no es válido." }, { status: 400 });
    }

    const effectiveLevel =
      patch.educationLevel ?? (await getUserProfile(sessionUser.uid))?.educationLevel ?? null;
    const maxGrade = effectiveLevel === "primaria" ? 6 : 5;
    if (body.grade < 1 || body.grade > maxGrade) {
      return Response.json({ error: "El grado no es válido." }, { status: 400 });
    }
    patch.grade = body.grade;
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No hay cambios que guardar." }, { status: 400 });
  }

  await updateProfileDetails(sessionUser.uid, patch);
  invalidateUserProfileCache(sessionUser.uid);
  return Response.json({ ok: true });
}
