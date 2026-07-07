"use client";

import { useState, useTransition } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { notifyWhenInStock } from "@/app/actions/catalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NotifyMeForm({ variantId }: { variantId: string }) {
  const [contact, setContact] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-accent-soft p-3 text-sm text-accent">
        <BellRing className="h-4 w-4 shrink-0" />
        Бүртгэгдлээ! Бараа ирмэгц мэдэгдэнэ.
      </p>
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const isEmail = contact.includes("@");
        startTransition(async () => {
          const res = await notifyWhenInStock({
            variantId,
            email: isEmail ? contact : undefined,
            phone: isEmail ? undefined : contact,
          });
          if (res.ok) {
            setDone(true);
          } else {
            toast.error(res.message);
          }
        });
      }}
    >
      <Input
        required
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Утас эсвэл имэйл"
        aria-label="Утас эсвэл имэйл хаяг"
        className="h-10"
      />
      <Button type="submit" variant="soft" size="sm" disabled={pending}>
        <BellRing className="h-4 w-4" />
        {pending ? "…" : "Мэдэгд"}
      </Button>
    </form>
  );
}
