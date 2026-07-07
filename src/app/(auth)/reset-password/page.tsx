import type { Metadata } from "next";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Шинэ нууц үг" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="font-display mb-6 text-center text-2xl">Шинэ нууц үг тохируулах</h1>
      <ResetForm />
    </>
  );
}
