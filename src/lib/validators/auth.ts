import { z } from "zod";

/** Mongolian mobile: 8 digits, starts 5–9 (e.g. 99112233). */
export const mnPhone = z
  .string()
  .trim()
  .regex(/^[5-9]\d{7}$/, "Утасны дугаар 8 оронтой байх ёстой (ж: 99112233)");

export const loginSchema = z.object({
  email: z.string().trim().email("Имэйл хаяг буруу байна"),
  password: z.string().min(6, "Нууц үг доод тал нь 6 тэмдэгт"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Нэрээ оруулна уу"),
    phone: mnPhone,
    email: z.string().trim().email("Имэйл хаяг буруу байна"),
    password: z
      .string()
      .min(8, "Нууц үг доод тал нь 8 тэмдэгт")
      .regex(/[a-zA-Z]/, "Нууц үг үсэг агуулсан байх ёстой")
      .regex(/\d/, "Нууц үг тоо агуулсан байх ёстой"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Нууц үг таарахгүй байна",
  });

export const forgotSchema = z.object({
  email: z.string().trim().email("Имэйл хаяг буруу байна"),
});

export const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Нууц үг доод тал нь 8 тэмдэгт")
      .regex(/[a-zA-Z]/, "Нууц үг үсэг агуулсан байх ёстой")
      .regex(/\d/, "Нууц үг тоо агуулсан байх ёстой"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Нууц үг таарахгүй байна",
  });

export type FieldErrors = Record<string, string[]>;

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  return error.flatten().fieldErrors as FieldErrors;
}
