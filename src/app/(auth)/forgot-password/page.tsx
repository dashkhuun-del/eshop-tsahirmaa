import type { Metadata } from "next";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Нууц үг сэргээх" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="font-display mb-2 text-center text-2xl">Нууц үг сэргээх</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Имэйл хаягаа оруулбал сэргээх холбоос илгээнэ
      </p>
      <ForgotForm />
    </>
  );
}
