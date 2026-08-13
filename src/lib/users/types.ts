export type EducationLevel = "primaria" | "secundaria";

export interface UserProfile {
  uid: string;
  email: string | null;
  photoURL: string | null;
  name: string;
  age: number | null;
  birthDate: string | null;
  educationLevel: EducationLevel | null;
  grade: number | null;
  onboardingCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}
