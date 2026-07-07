"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthState } from "../actions";
import { Field } from "@/components/auth/field";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registerAction,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Овог нэр"
        name="fullName"
        autoComplete="name"
        placeholder="Болд Сараа"
        errors={state.fieldErrors?.fullName}
      />
      <Field
        label="Утасны дугаар"
        name="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="99112233"
        errors={state.fieldErrors?.phone}
      />
      <Field
        label="Имэйл"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tanii@mail.mn"
        errors={state.fieldErrors?.email}
      />
      <Field
        label="Нууц үг"
        name="password"
        type="password"
        autoComplete="new-password"
        errors={state.fieldErrors?.password}
      />
      <Field
        label="Нууц үг давтах"
        name="confirm"
        type="password"
        autoComplete="new-password"
        errors={state.fieldErrors?.confirm}
      />
      {state.formError && (
        <p className="text-sm text-danger">{state.formError}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Бүртгэж байна…" : "Бүртгүүлэх"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Бүртгэлтэй юу?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Нэвтрэх
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Бүртгүүлснээр та{" "}
        <Link href="/terms" className="underline">үйлчилгээний нөхцөл</Link>-ийг
        зөвшөөрч байна.
      </p>
    </form>
  );
}
