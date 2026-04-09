import { AppTopbar } from "@/components/app-topbar";
import { DashboardUserMenu } from "@/components/dashboard-user-menu";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/database.types";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/utils";
import { AlertTriangle, Package, Receipt, ShoppingBag, Store, Wallet } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type MembershipRow = Pick<Tables<"user_business_roles">, "business_id" | "role">;
type BusinessRow = Pick<Tables<"businesses">, "name" | "currency_code">;
type DayRow = Pick<Tables<"business_days">, "id" | "business_date" | "status">;
type SaleRow = Pick<Tables<"sales">, "id" | "status" | "total_amount" | "created_at">;
type ExpenseRow = Pick<Tables<"expenses">, "amount">;
type SaleItemWithProduct = Pick<Tables<"sale_items">, "product_id" | "quantity" | "line_total"> & {
  products:
    | {
        name: string;
      }[]
    | null;
};
type StockWithProduct = Pick<Tables<"day_inventory">, "product_id" | "available_qty" | "initial_qty" | "sold_qty"> & {
  products: {
    name: string;
  } | null;
};

function DashboardFallback() {
  return (
    <main className="px-4 pb-28 pt-6">
      <div className="mx-auto w-full max-w-md animate-pulse space-y-4">
        <div className="h-4 w-28 rounded bg-secondary" />
        <div className="h-8 w-44 rounded bg-secondary" />
        <div className="h-20 rounded-2xl bg-card" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 rounded-2xl bg-card" />
          <div className="h-24 rounded-2xl bg-card" />
          <div className="h-24 rounded-2xl bg-card" />
          <div className="h-24 rounded-2xl bg-card" />
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  if (!hasSupabaseEnv) {
    return (
      <main className="px-4 pb-28 pt-6">
        <div className="mx-auto w-full max-w-md space-y-4">
          <Card className="rounded-[1.8rem] border-border/70 bg-card/95 shadow-[0_24px_50px_-42px_rgba(0,0,0,0.55)]">
            <CardHeader>
              <CardTitle className="text-xl">Falta configurar Supabase</CardTitle>
              <CardDescription>
                Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en tu entorno para habilitar autenticacion y datos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Usa los valores desde tu proyecto en Supabase, en Settings &gt; API.</p>
              <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 font-mono text-xs text-foreground/80">
                NEXT_PUBLIC_SUPABASE_URL=...
                <br />
                NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOutAction() {
    "use server";
    const supabaseForAction = await createClient();
    await supabaseForAction.auth.signOut();
    redirect("/");
  }

  if (!user) {
    redirect("/login");
  }

  const { data: membershipData } = await supabase
    .from("user_business_roles")
    .select("business_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const membership = membershipData as MembershipRow | null;

  const formatCurrency = (amount: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `$${Math.round(amount).toLocaleString("es-CO")}`;
    }
  };

  if (!membership) {
    return (
      <main className="px-4 pb-28 pt-6">
        <div className="mx-auto w-full max-w-md space-y-4">
          <Card className="rounded-2xl border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="text-xl">Sin negocio asignado</CardTitle>
              <CardDescription>
                Tu usuario esta autenticado, pero aun no tiene una sucursal vinculada. Pidele al administrador que te asigne un negocio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" className="w-full">
                  Cerrar sesion
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const [businessResult, dayResult] = await Promise.all([
    supabase.from("businesses").select("name, currency_code").eq("id", membership.business_id).maybeSingle(),
    supabase
      .from("business_days")
      .select("id, business_date, status")
      .eq("business_id", membership.business_id)
      .order("business_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const business = (businessResult.data ?? null) as BusinessRow | null;
  const currentDay = (dayResult.data ?? null) as DayRow | null;

  const [salesResult, expensesResult, stockResult] = currentDay
    ? await Promise.all([
        supabase
          .from("sales")
          .select("id, total_amount, status, created_at")
          .eq("business_id", membership.business_id)
          .eq("day_id", currentDay.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("expenses")
          .select("amount")
          .eq("business_id", membership.business_id)
          .eq("day_id", currentDay.id),
        supabase
          .from("day_inventory")
          .select("product_id, available_qty, initial_qty, sold_qty, products(name)")
          .eq("business_id", membership.business_id)
          .eq("day_id", currentDay.id),
      ])
    : [
        { data: [] as SaleRow[] },
        { data: [] as ExpenseRow[] },
        { data: [] as StockWithProduct[] },
      ];

  const sales = (salesResult.data ?? []) as SaleRow[];
  const expenses = (expensesResult.data ?? []) as ExpenseRow[];
  const stockRows = (stockResult.data ?? []) as StockWithProduct[];

  const saleIds = sales.map((sale) => sale.id);

  const saleItems = saleIds.length
    ? ((
        await supabase
          .from("sale_items")
          .select("product_id, quantity, line_total, products(name)")
          .eq("business_id", membership.business_id)
          .in("sale_id", saleIds)
      ).data ?? [])
    : [];

  const saleItemsRows = saleItems as SaleItemWithProduct[];
  const completedSales = sales.filter((sale) => sale.status === "completed");

  const totalVentas = completedSales.reduce((acc, sale) => acc + sale.total_amount, 0);
  const totalUnidades = saleItemsRows.reduce((acc, item) => acc + item.quantity, 0);
  const totalEgresos = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const utilidadEstimada = totalVentas - totalEgresos;

  const topProductMap = new Map<string, { name: string; quantity: number; total: number }>();
  for (const item of saleItemsRows) {
    const name = item.products?.[0]?.name ?? "Producto";
    const prev = topProductMap.get(item.product_id);
    topProductMap.set(item.product_id, {
      name,
      quantity: (prev?.quantity ?? 0) + item.quantity,
      total: (prev?.total ?? 0) + (item.line_total ?? 0),
    });
  }

  const topProduct = [...topProductMap.values()].sort((a, b) => b.quantity - a.quantity)[0] ?? null;

  const stockSummary = stockRows
    .map((row) => {
      const stockInicial = row.initial_qty > 0 ? row.initial_qty : (row.available_qty ?? 0) + row.sold_qty;
      const porcentaje = stockInicial > 0 ? Math.round(((row.available_qty ?? 0) / stockInicial) * 100) : 0;
      return {
        name: row.products?.name ?? "Producto",
        percentage: porcentaje,
      };
    })
    .sort((a, b) => a.percentage - b.percentage);

  const stockCritico = stockSummary.filter((item) => item.percentage <= 25);
  const dateLabel = currentDay
    ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(currentDay.business_date))
    : "Sin dia operativo";
  const nombreNegocio = business?.name ?? "Tony's Kitchen Ops";
  const moneda = business?.currency_code ?? "COP";
  return (
    <main className="px-4 pb-28 pt-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <AppTopbar
          eyebrow="Vista general"
          title="Dashboard"
          description={`${nombreNegocio} · ${dateLabel}`}
          rightSlot={<DashboardUserMenu signOutAction={signOutAction} />}
        />

        {currentDay?.status === "open" ? (
          <Card className="rounded-2xl border-primary/35 bg-primary/10">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Dia operativo abierto</p>
                <p className="text-xs text-muted-foreground">
                  {stockCritico.length > 0
                    ? `${stockCritico.length} productos requieren reposicion prioritaria.`
                    : "Inventario en buen estado para continuar vendiendo."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border-amber-400/40 bg-amber-100/50">
            <CardContent className="flex items-start gap-3 p-4">
              <Store className="mt-0.5 size-5 text-amber-700" />
              <div>
                <p className="text-sm font-semibold text-foreground">No hay dia operativo activo</p>
                <p className="text-xs text-muted-foreground">Abre el dia para empezar a registrar ventas y gastos.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Rendimiento de hoy</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="rounded-2xl border-border/70 bg-card/95">
              <CardContent className="space-y-2 p-4">
                <Wallet className="size-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Ventas</p>
                <p className="text-2xl font-semibold leading-none">{formatCurrency(totalVentas, moneda)}</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 bg-card/95">
              <CardContent className="space-y-2 p-4">
                <ShoppingBag className="size-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Unidades</p>
                <p className="text-2xl font-semibold leading-none">{totalUnidades.toLocaleString("es-CO")}</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 bg-card/95">
              <CardContent className="space-y-2 p-4">
                <Receipt className="size-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Egresos</p>
                <p className="text-2xl font-semibold leading-none">{formatCurrency(totalEgresos, moneda)}</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 bg-card/95">
              <CardContent className="space-y-2 p-4">
                <Package className="size-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Utilidad</p>
                <p className="text-2xl font-semibold leading-none">{formatCurrency(utilidadEstimada, moneda)}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Producto destacado</h2>
          <Card className="rounded-2xl border-border/70 bg-card/95">
            <CardContent className="space-y-2 p-4">
              <p className="text-lg font-semibold">
                {topProduct?.name ?? "Sin ventas registradas"}
              </p>
              <p className="text-sm text-muted-foreground">
                {topProduct
                  ? `${topProduct.quantity.toLocaleString("es-CO")} unidades · ${formatCurrency(topProduct.total, moneda)}`
                  : "Cuando registres ventas, aqui veras el producto mas vendido del dia."}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Estado de stock</h2>
          <Card className="rounded-2xl border-border/70 bg-card/95">
            <CardContent className="space-y-3 p-4">
              {stockSummary.length > 0 ? (
                stockSummary.slice(0, 4).map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className={`text-xs font-semibold ${item.percentage <= 25 ? "text-destructive" : "text-foreground/70"}`}>
                        {item.percentage}%
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div
                        className={`h-2 rounded-full ${item.percentage <= 25 ? "bg-destructive" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(Math.max(item.percentage, 4), 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin inventario cargado para el dia actual.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <MobileBottomNav active="dashboard" />
    </main>
  );
}
