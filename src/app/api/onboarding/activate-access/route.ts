import { getSessionUser } from "@/lib/auth/session";
import { updateOnboardingDetails } from "@/lib/users/profile";
import { isValidBirthDate } from "@/lib/dashboard/birthday";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  const { name, age, birthDate, educationLevel, grade } = await request.json();

  if (typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "El nombre es requerido." }, { status: 400 });
  }
  if (typeof age !== "number" || age < 1 || age > 50) {
    return Response.json({ error: "La edad debe estar entre 1 y 50." }, { status: 400 });
  }
  if (typeof birthDate !== "string" || !isValidBirthDate(birthDate)) {
    return Response.json({ error: "La fecha de cumpleaños no es válida." }, { status: 400 });
  }
  if (educationLevel !== "primaria" && educationLevel !== "secundaria") {
    return Response.json({ error: "El nivel educativo no es válido." }, { status: 400 });
  }
  const maxGrade = educationLevel === "primaria" ? 6 : 5;
  if (typeof grade !== "number" || grade < 1 || grade > maxGrade) {
    return Response.json({ error: "El grado no es válido." }, { status: 400 });
  }

  await updateOnboardingDetails(sessionUser.uid, {
    name: name.trim(),
    age,
    birthDate,
    educationLevel,
    grade,
  });

  return Response.json({ ok: true });
}
