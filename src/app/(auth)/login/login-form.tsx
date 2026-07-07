"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type AuthState } from "../actions";
import { Field } from "@/components/auth/field";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState<AuthState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={params.get("next") ?? ""} />
      {params.get("reset") && (
        <p className="rounded-lg bg-accent-soft p-3 text-sm text-accent">
          Нууц үг амжилттай шинэчлэгдлээ. Нэвтэрнэ үү.
        </p>
      )}
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
        autoComplete="current-password"
        errors={state.fieldErrors?.password}
      />
      {state.formError && (
        <p className="text-sm text-danger">{state.formError}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Нэвтэрч байна…" : "Нэвтрэх"}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-muted-foreground hover:text-accent">
          Нууц үгээ мартсан?
        </Link>
        <Link href="/register" className="font-medium text-accent hover:underline">
          Бүртгүүлэх
        </Link>
      </div>
    </form>
  );
}
