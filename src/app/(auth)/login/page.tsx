import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Нэвтрэх" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display mb-6 text-center text-2xl">Тавтай морил</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
