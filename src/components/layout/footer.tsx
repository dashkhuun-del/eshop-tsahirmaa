import Link from "next/link";
import { CreditCard, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { FlowerMark, Wordmark } from "@/components/brand/flower-mark";

const groups = [
  {
    title: "Дэлгүүр",
    links: [
      { href: "/shop", label: "Бүх бүтээгдэхүүн" },
      { href: "/new", label: "Шинэ ирсэн" },
      { href: "/best-sellers", label: "Эрэлттэй" },
      { href: "/sale", label: "Хямдрал" },
    ],
  },
  {
    title: "Тусламж",
    links: [
      { href: "/delivery", label: "Хүргэлтийн мэдээлэл" },
      { href: "/returns", label: "Буцаалтын нөхцөл" },
      { href: "/faq", label: "Түгээмэл асуулт" },
      { href: "/contact", label: "Холбоо барих" },
    ],
  },
  {
    title: "Компани",
    links: [
      { href: "/about", label: "Бидний тухай" },
      { href: "/privacy", label: "Нууцлалын бодлого" },
      { href: "/terms", label: "Үйлчилгээний нөхцөл" },
    ],
  },
];

const trust = [
  { icon: Truck, label: "Шуурхай хүргэлт", sub: "УБ хотод 24–48 цаг" },
  { icon: RotateCcw, label: "Хялбар буцаалт", sub: "7 хоногийн дотор" },
  { icon: ShieldCheck, label: "Баталгаат чанар", sub: "Албан ёсны бүтээгдэхүүн" },
  { icon: CreditCard, label: "Найдвартай төлбөр", sub: "QPay · Банкны апп · Карт" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-surface">
      {/* Trust strip */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
        {trust.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Монгол эмэгтэйчүүдэд зориулсан дэгжин, чанартай загварын
              бутик. Улаанбаатар хот болон орон нутагт хүргэлттэй.
            </p>
            <p className="mt-4 text-sm font-medium">
              📞 7700-0000 · Даваа–Ням 10:00–20:00
            </p>
          </div>
          {groups.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <p className="eyebrow mb-4">{g.title}</p>
              <ul className="space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Цахирмаа Boutique. Бүх эрх хуулиар хамгаалагдсан.</p>
          <p className="flex items-center gap-1.5">
            <FlowerMark className="h-4 w-4 opacity-60" /> Facebook · Instagram
          </p>
        </div>
      </div>
    </footer>
  );
}
