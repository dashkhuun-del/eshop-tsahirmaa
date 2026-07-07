"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthState } from "../actions";
import { Field } from "@/components/auth/field";
import { Button } from "@/components/ui/button";

export function ResetForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    resetPasswordAction,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Шинэ нууц үг"
        name="password"
        type="password"
        autoComplete="new-password"
        errors={state.fieldErrors?.password}
      />
      <Field
        label="Шинэ нууц үг давтах"
        name="confirm"
        type="password"
        autoComplete="new-password"
        errors={state.fieldErrors?.confirm}
      />
      {state.formError && <p className="text-sm text-danger">{state.formError}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Шинэчилж байна…" : "Нууц үг шинэчлэх"}
      </Button>
    </form>
  );
}
