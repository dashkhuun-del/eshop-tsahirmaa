"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type AuthState } from "../actions";
import { Field } from "@/components/auth/field";
import { Button } from "@/components/ui/button";

export function ForgotForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    forgotPasswordAction,
    {}
  );

  if (state.success) {
    return <p className="rounded-lg bg-accent-soft p-4 text-sm">{state.success}</p>;
  }

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Бүртгэлтэй имэйл"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tanii@mail.mn"
        errors={state.fieldErrors?.email}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Илгээж байна…" : "Сэргээх холбоос авах"}
      </Button>
    </form>
  );
}
