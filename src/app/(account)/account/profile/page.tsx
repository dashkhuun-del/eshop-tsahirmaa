import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Award, LogOut, Package, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Миний бүртгэл" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, email, points_balance, created_at")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="eyebrow mb-2">Миний бүртгэл</p>
      <h1 className="font-display mb-8 text-3xl">
        Сайн байна уу, {profile?.full_name || "эрхэм хэрэглэгч"}!
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-surface p-5">
          <User className="mb-3 h-5 w-5 text-accent" />
          <p className="text-sm font-semibold">Хувийн мэдээлэл</p>
          <p className="mt-2 text-sm text-muted-foreground">{profile?.email}</p>
          <p className="text-sm text-muted-foreground">
            {profile?.phone || "Утас бүртгээгүй"}
          </p>
        </div>
        <div className="rounded-xl border bg-surface p-5">
          <Award className="mb-3 h-5 w-5 text-accent" />
          <p className="text-sm font-semibold">Урамшууллын оноо</p>
          <p className="font-display mt-2 text-2xl text-accent">
            {profile?.points_balance ?? 0}
            <span className="ml-1 text-sm text-muted-foreground">оноо</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/account/orders" className="flex-1">
          <Button variant="soft" className="w-full">
            <Package className="h-4 w-4" /> Миний захиалгууд
          </Button>
        </Link>
        <form action={logoutAction} className="flex-1">
          <Button variant="outline" type="submit" className="w-full">
            <LogOut className="h-4 w-4" /> Гарах
          </Button>
        </form>
      </div>
    </div>
  );
}
