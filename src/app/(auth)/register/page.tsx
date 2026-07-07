import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Бүртгүүлэх" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="font-display mb-2 text-center text-2xl">Бүртгэл үүсгэх</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Захиалгаа хянаж, урамшууллын оноо цуглуулаарай
      </p>
      <RegisterForm />
    </>
  );
}
