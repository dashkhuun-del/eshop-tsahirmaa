import { FlowerMark } from "@/components/brand/flower-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <FlowerMark className="mb-4 h-10 w-10" />
      </div>
      <div className="rounded-xl border bg-surface p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
