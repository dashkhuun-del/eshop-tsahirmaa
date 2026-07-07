"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotSchema,
  resetSchema,
  zodFieldErrors,
  type FieldErrors,
} from "@/lib/validators/auth";

export type AuthState = {
  fieldErrors?: FieldErrors;
  formError?: string;
  success?: string;
};

const SAFE_NEXT = /^\/(?!\/)/; // only same-site relative paths

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { formError: "Имэйл эсвэл нууц үг буруу байна" };

  const next = formData.get("next");
  revalidatePath("/", "layout");
  redirect(typeof next === "string" && SAFE_NEXT.test(next) ? next : "/account/profile");
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createClient();
  const { email, password, fullName, phone } = parsed.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  });

  if (error) {
    if (error.code === "user_already_exists")
      return { formError: "Энэ имэйлээр бүртгэл үүссэн байна. Нэвтэрнэ үү." };
    return { formError: "Бүртгэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу." };
  }

  revalidatePath("/", "layout");
  redirect("/account/profile?welcome=1");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${site}/reset-password`,
  });

  // Same message whether or not the account exists (no user enumeration)
  return {
    success:
      "Хэрэв энэ имэйлээр бүртгэл байгаа бол нууц үг сэргээх холбоос илгээгдлээ. Имэйлээ шалгана уу.",
  };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error)
    return {
      formError:
        "Холбоос хүчингүй болсон байна. Нууц үг сэргээх хүсэлтээ дахин илгээнэ үү.",
    };

  redirect("/login?reset=1");
}
