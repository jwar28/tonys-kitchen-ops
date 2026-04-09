import { CreateProductDialog } from "@/components/products/create-product-dialog";
import { ProductsCatalog } from "@/components/products/products-catalog";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Enums, Tables, TablesInsert, TablesUpdate } from "@/database.types";
import { createClient } from "@/lib/supabase/server";
import { ArrowUpDown, Package, Store, Tag, ToggleLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type ProductsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type MembershipRow = Pick<Tables<"user_business_roles">, "business_id" | "role">;
type BusinessRow = Pick<Tables<"businesses">, "currency_code" | "name">;
type ProductRow = Tables<"products">;
type ProductCategory = Enums<"product_category">;

const categoryOptions: Array<{
  value: ProductCategory;
  label: string;
  tone: string;
}> = [
  { value: "frito", label: "Fritos", tone: "bg-amber-100 text-amber-900 border-amber-200" },
  { value: "pizza", label: "Pizzas", tone: "bg-rose-100 text-rose-900 border-rose-200" },
  { value: "bebida", label: "Bebidas", tone: "bg-sky-100 text-sky-900 border-sky-200" },
  { value: "otro", label: "Otros", tone: "bg-stone-200 text-stone-800 border-stone-300" },
];

function isProductCategory(value: string | undefined): value is ProductCategory {
  return categoryOptions.some((option) => option.value === value);
}

function formatCurrency(amount: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${Math.round(amount).toLocaleString("es-CO")}`;
  }
}

function readRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNumber(formData: FormData, key: string, field: string) {
  const raw = String(formData.get(key) ?? "").trim();
  const value = Number(raw);

  if (!raw) {
    throw new Error(`Completa ${field}.`);
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} debe ser un numero valido.`);
  }

  return value;
}

function parseProductPayload(formData: FormData) {
  const name = readRequiredString(formData, "name");
  const unit = readRequiredString(formData, "unit");
  const categoryRaw = readRequiredString(formData, "category");
  const category = isProductCategory(categoryRaw) ? categoryRaw : "otro";
  const salePrice = readNumber(formData, "sale_price", "precio de venta");
  const costPrice = readNumber(formData, "cost_price", "costo");
  const sortOrderRaw = String(formData.get("sort_order") ?? "").trim();
  const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : 0;

  if (!name) {
    throw new Error("Escribe un nombre para el producto.");
  }

  if (!unit) {
    throw new Error("Escribe la unidad de venta.");
  }

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("El orden debe ser un entero igual o mayor a 0.");
  }

  return {
    name,
    unit,
    category,
    sale_price: salePrice,
    cost_price: costPrice,
    sort_order: sortOrder,
  } satisfies Pick<TablesInsert<"products">, "name" | "unit" | "category" | "sale_price" | "cost_price" | "sort_order">;
}

async function requireViewerContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  return {
    supabase,
    user,
    membership: (membershipData ?? null) as MembershipRow | null,
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { supabase, membership } = await requireViewerContext();
  const statusFilter = "active";
  const categoryFilter = "all";

  async function createProductAction(formData: FormData) {
    "use server";

    const { supabase, user, membership } = await requireViewerContext();

    if (!membership) {
      redirect("/products?error=No%20tienes%20un%20negocio%20asignado");
    }

    let payload: TablesInsert<"products">;

    try {
      payload = {
        ...parseProductPayload(formData),
        business_id: membership.business_id,
        created_by: user.id,
        is_active: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo validar el formulario.";
      redirect(`/products?error=${encodeURIComponent(message)}`);
    }

    const { error } = await supabase.from("products").insert(payload);

    if (error) {
      redirect("/products?error=No%20se%20pudo%20crear%20el%20producto");
    }

    revalidatePath("/products");
    redirect("/products?success=Producto%20creado%20correctamente");
  }

  async function updateProductAction(formData: FormData) {
    "use server";

    const { supabase, membership } = await requireViewerContext();
    const productId = readRequiredString(formData, "product_id");

    if (!membership) {
      redirect("/products?error=No%20tienes%20un%20negocio%20asignado");
    }

    let payload: TablesUpdate<"products">;

    try {
      payload = parseProductPayload(formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo validar el formulario.";
      redirect(`/products?error=${encodeURIComponent(message)}`);
    }

    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", productId)
      .eq("business_id", membership.business_id);

    if (error) {
      redirect("/products?error=No%20se%20pudo%20actualizar%20el%20producto");
    }

    revalidatePath("/products");
    redirect("/products?success=Producto%20actualizado");
  }

  async function toggleProductAction(formData: FormData) {
    "use server";

    const { supabase, membership } = await requireViewerContext();
    const productId = readRequiredString(formData, "product_id");
    const nextStatus = readRequiredString(formData, "next_status") === "true";

    if (!membership) {
      redirect("/products?error=No%20tienes%20un%20negocio%20asignado");
    }

    const { error } = await supabase
      .from("products")
      .update({ is_active: nextStatus })
      .eq("id", productId)
      .eq("business_id", membership.business_id);

    if (error) {
      redirect("/products?error=No%20se%20pudo%20cambiar%20el%20estado");
    }

    revalidatePath("/products");
    redirect(`/products?success=${encodeURIComponent(nextStatus ? "Producto reactivado" : "Producto desactivado")}`);
  }

  if (!membership) {
    return (
      <main className="px-4 pb-28 pt-6">
        <div className="mx-auto w-full max-w-md">
          <Card className="rounded-[1.8rem] border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle>No tienes un negocio asignado</CardTitle>
              <CardDescription>
                Tu usuario esta autenticado, pero aun no tiene una sucursal vinculada para administrar productos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/">Volver al dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { data: businessData } = await supabase
    .from("businesses")
    .select("name, currency_code")
    .eq("id", membership.business_id)
    .maybeSingle();

  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", membership.business_id)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  const { data: allProductsData } = await supabase
    .from("products")
    .select("id, category, is_active, sale_price, cost_price")
    .eq("business_id", membership.business_id);

  const business = (businessData ?? null) as BusinessRow | null;
  const products = (productsData ?? []) as ProductRow[];
  const allProducts =
    ((allProductsData ?? []) as Array<Pick<ProductRow, "id" | "category" | "is_active" | "sale_price" | "cost_price">>) ?? [];
  const currencyCode = business?.currency_code ?? "COP";
  const businessName = business?.name ?? "Tony's Kitchen Ops";
  const activeProducts = allProducts.filter((product) => product.is_active).length;
  const inactiveProducts = allProducts.length - activeProducts;
  const usedCategories = new Set(allProducts.map((product) => product.category)).size;
  const totalPotentialProfit = allProducts.reduce(
    (acc, product) => acc + Math.max(product.sale_price - product.cost_price, 0),
    0,
  );

  return (
    <main className="px-4 pb-28 pt-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-[linear-gradient(140deg,rgba(255,255,255,0.95),rgba(242,234,225,0.9))] px-5 py-5 shadow-[0_30px_70px_-48px_rgba(0,0,0,0.6)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(217,70,45,0.1),transparent_26%),radial-gradient(circle_at_90%_10%,rgba(255,202,116,0.18),transparent_24%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/55">Catalogo</p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-primary">Productos</h1>
              <p className="mt-2 max-w-[16rem] text-sm text-muted-foreground">
                Organiza lo que vendes, controla precios y manten visible lo que realmente esta en menu.
              </p>
            </div>
            <div className="grid size-16 shrink-0 place-items-center rounded-[1.4rem] border border-primary/15 bg-white/80 text-primary shadow-sm">
              <Store className="size-7" />
            </div>
          </div>
          <div className="relative mt-4 rounded-[1.35rem] border border-primary/15 bg-white/75 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">Negocio actual</p>
            <p className="mt-1 text-lg font-semibold">{businessName}</p>
          </div>
        </header>

        {params.success ? (
          <Card className="rounded-[1.5rem] border-emerald-300/60 bg-emerald-50/90 shadow-[0_18px_45px_-36px_rgba(16,185,129,0.9)]">
            <CardContent className="px-4 py-3 text-sm font-medium text-emerald-900">{params.success}</CardContent>
          </Card>
        ) : null}

        {params.error ? (
          <Card className="rounded-[1.5rem] border-destructive/25 bg-destructive/10 shadow-[0_18px_45px_-36px_rgba(220,38,38,0.85)]">
            <CardContent className="px-4 py-3 text-sm font-medium text-destructive">{params.error}</CardContent>
          </Card>
        ) : null}

        <section className="grid grid-cols-2 gap-3">
          <Card className="rounded-[1.6rem] border-border/60 bg-card/95">
            <CardContent className="space-y-2 p-4">
              <Package className="size-4 text-primary" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Activos</p>
              <p className="text-2xl font-semibold leading-none">{activeProducts}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[1.6rem] border-border/60 bg-card/95">
            <CardContent className="space-y-2 p-4">
              <ToggleLeft className="size-4 text-primary" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Inactivos</p>
              <p className="text-2xl font-semibold leading-none">{inactiveProducts}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[1.6rem] border-border/60 bg-card/95">
            <CardContent className="space-y-2 p-4">
              <Tag className="size-4 text-primary" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Categorias</p>
              <p className="text-2xl font-semibold leading-none">{usedCategories}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[1.6rem] border-border/60 bg-card/95">
            <CardContent className="space-y-2 p-4">
              <ArrowUpDown className="size-4 text-primary" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Ganancia potencial</p>
              <p className="text-2xl font-semibold leading-none">{formatCurrency(totalPotentialProfit, currencyCode)}</p>
            </CardContent>
          </Card>
        </section>

        <ProductsCatalog
          currencyCode={currencyCode}
          initialCategoryFilter={categoryFilter}
          initialStatusFilter={statusFilter}
          products={products}
          categoryOptions={categoryOptions}
          updateProductAction={updateProductAction}
          toggleProductAction={toggleProductAction}
        />
      </div>

      <CreateProductDialog
        action={createProductAction}
        categories={categoryOptions.map(({ value, label }) => ({ value, label }))}
      />
      <MobileBottomNav active="products" />
    </main>
  );
}
