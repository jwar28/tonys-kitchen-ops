import { cn } from "@/lib/utils";
import { Package, ShoppingBag, Store, Wallet } from "lucide-react";
import Link from "next/link";

type BottomNavSection = "dashboard" | "products" | "sales" | "cash";

type MobileBottomNavProps = {
  active: BottomNavSection;
};

const items: Array<{
  id: BottomNavSection;
  label: string;
  href?: string;
  icon: typeof Store;
}> = [
  { id: "dashboard", label: "Inicio", href: "/", icon: Store },
  { id: "products", label: "Productos", href: "/products", icon: Package },
  { id: "sales", label: "Ventas", icon: ShoppingBag },
  { id: "cash", label: "Caja", icon: Wallet },
];

export function MobileBottomNav({ active }: MobileBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-card/95 px-4 pb-3.5 pt-3 backdrop-blur">
      <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-2 rounded-[1.75rem] border border-white/50 bg-background/80 p-2 shadow-[0_12px_34px_-24px_rgba(0,0,0,0.55)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;

          const content = (
            <div
              className={cn(
                "flex h-[3.7rem] w-full flex-col items-center justify-center gap-1 rounded-[1.1rem] px-1.5 text-center transition",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
                item.href ? "hover:brightness-[1.02]" : "opacity-70",
              )}
            >
              <Icon className="size-[0.95rem]" />
              <span className="w-full px-0.5 text-[8.5px] font-semibold uppercase leading-tight tracking-[0.05em]">{item.label}</span>
            </div>
          );

          if (!item.href) {
            return (
              <div key={item.id} aria-disabled="true" className="block w-full">
                {content}
              </div>
            );
          }

          return (
            <Link key={item.id} href={item.href} className="block w-full">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
