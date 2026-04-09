import { AppTopbar } from "@/components/app-topbar";
import { CreateProductDialog } from "@/components/products/create-product-dialog";
import { PageSkeleton } from "@/components/loading/page-skeleton";
import { ProductsCatalog } from "@/components/products/products-catalog";
import { ProductsStatusToast } from "@/components/products/products-status-toast";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Enums, Tables, TablesInsert, TablesUpdate } from "@/database.types";
import { isBoneyardServerRequest } from "@/lib/boneyard";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/utils";
import { ArrowUpDown, Package, Tag, ToggleLeft } from "lucide-react";
import Image from "next/image";
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

const productImagesBucket = "images";
const productEditors = new Set<MembershipRow["role"]>(["owner", "manager"]);

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

function slugifyProductName(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  return normalized || "producto";
}

function getImageExtension(file: File) {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  if (fileExtension) {
    return fileExtension;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function buildProductImagePath(businessId: string, productName: string, file: File) {
  return `products/${businessId}/${slugifyProductName(productName)}.${getImageExtension(file)}`;
}

function renameProductImagePath(currentPath: string, nextProductName: string) {
  const segments = currentPath.split("/");
  const currentFileName = segments.at(-1);

  if (!currentFileName) {
    return currentPath;
  }

  const extension = currentFileName.includes(".") ? currentFileName.split(".").pop() : "jpg";
  segments[segments.length - 1] = `${slugifyProductName(nextProductName)}.${extension}`;

  return segments.join("/");
}

function readOptionalImageFile(formData: FormData, key: string) {
  const candidate = formData.get(key);

  if (!(candidate instanceof File) || candidate.size === 0) {
    return null;
  }

  if (!candidate.type.startsWith("image/")) {
    throw new Error("La referencia visual debe ser una imagen valida.");
  }

  if (candidate.size > 5 * 1024 * 1024) {
    throw new Error("La imagen no puede superar 5 MB.");
  }

  return candidate;
}

function formatSupabaseError(error: { message: string; details?: string | null; hint?: string | null; code?: string }) {
  return [error.message, error.details, error.hint, error.code ? `codigo ${error.code}` : null]
    .filter(Boolean)
    .join(" | ");
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
  const isBoneyard = await isBoneyardServerRequest();

  if (!hasSupabaseEnv) {
    return (
      <main className="px-4 pb-28 pt-6">
        <div className="mx-auto w-full max-w-md">
          <Card className="rounded-[1.8rem] border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle>Falta configurar Supabase</CardTitle>
              <CardDescription>
                Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para administrar el catalogo.
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

  if (isBoneyard) {
    const sampleProducts = [
      {
        id: "sample-1",
        business_id: "sample-business",
        name: "Empanada de pollo",
        category: "frito",
        unit: "unidad",
        sale_price: 3500,
        cost_price: 1600,
        is_active: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        reference_image: null,
      },
      {
        id: "sample-2",
        business_id: "sample-business",
        name: "Pizza personal",
        category: "pizza",
        unit: "unidad",
        sale_price: 12000,
        cost_price: 6400,
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        reference_image: null,
      },
    ] satisfies ProductRow[];

    async function noopAction() {
      "use server";
    }

    return (
      <PageSkeleton name="products-page">
        <main className="px-4 pb-28 pt-6">
          <div className="mx-auto w-full max-w-md space-y-5">
            <AppTopbar
              eyebrow="Catalogo"
              title="Productos"
              description="Tony's Delicious Snacks · Organiza lo que vendes"
              rightSlot={
                <Link href="/" className="transition hover:brightness-105" aria-label="Volver al dashboard">
                  <Image
                    src="/logo.png"
                    alt="Tony's Kitchen Ops"
                    width={120}
                    height={120}
                    className="h-[5.75rem] w-[5.75rem] object-contain object-center"
                    unoptimized
                  />
                </Link>
              }
            />

            <section className="grid grid-cols-2 gap-3">
              <Card className="rounded-[1.6rem] border-border/60 bg-card/95"><CardContent className="space-y-2 p-4"><Package className="size-4 text-primary" /><p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Activos</p><p className="text-2xl font-semibold leading-none">2</p></CardContent></Card>
              <Card className="rounded-[1.6rem] border-border/60 bg-card/95"><CardContent className="space-y-2 p-4"><ToggleLeft className="size-4 text-primary" /><p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Inactivos</p><p className="text-2xl font-semibold leading-none">0</p></CardContent></Card>
              <Card className="rounded-[1.6rem] border-border/60 bg-card/95"><CardContent className="space-y-2 p-4"><Tag className="size-4 text-primary" /><p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Categorias</p><p className="text-2xl font-semibold leading-none">2</p></CardContent></Card>
              <Card className="rounded-[1.6rem] border-border/60 bg-card/95"><CardContent className="space-y-2 p-4"><ArrowUpDown className="size-4 text-primary" /><p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Ganancia potencial</p><p className="text-2xl font-semibold leading-none">{formatCurrency(7500, "COP")}</p></CardContent></Card>
            </section>

            <ProductsCatalog
              currencyCode="COP"
              initialCategoryFilter="all"
              initialStatusFilter="active"
              products={sampleProducts}
              categoryOptions={categoryOptions}
              updateProductAction={noopAction}
              toggleProductAction={noopAction}
            />
          </div>

          <CreateProductDialog action={noopAction} categories={categoryOptions.map(({ value, label }) => ({ value, label }))} />
          <MobileBottomNav active="products" />
        </main>
      </PageSkeleton>
    );
  }

  const { supabase, membership } = await requireViewerContext();
  const statusFilter = "active";
  const categoryFilter = "all";

  async function createProductAction(formData: FormData) {
    "use server";

    const { supabase, user, membership } = await requireViewerContext();

    if (!membership) {
      redirect("/products?error=No%20tienes%20un%20negocio%20asignado");
    }

    if (!productEditors.has(membership.role)) {
      redirect("/products?error=No%20tienes%20permisos%20para%20crear%20productos");
    }

    let payload: TablesInsert<"products">;
    let imageFile: File | null = null;
    let uploadedImagePath: string | null = null;

    try {
      imageFile = readOptionalImageFile(formData, "reference_image_file");
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

    if (imageFile) {
      uploadedImagePath = buildProductImagePath(membership.business_id, payload.name, imageFile);

      const { error: uploadError } = await supabase.storage.from(productImagesBucket).upload(uploadedImagePath, imageFile, {
        upsert: true,
        contentType: imageFile.type,
      });

      if (uploadError) {
        redirect(`/products?error=${encodeURIComponent(`No se pudo subir la imagen: ${uploadError.message}`)}`);
      }

      payload.reference_image = uploadedImagePath;
    }

    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("business_id", membership.business_id)
      .eq("name", payload.name)
      .maybeSingle();

    if (existingProduct) {
      if (uploadedImagePath) {
        await supabase.storage.from(productImagesBucket).remove([uploadedImagePath]);
      }

      redirect("/products?error=Ya%20existe%20un%20producto%20con%20ese%20nombre");
    }

    const { error } = await supabase.from("products").insert(payload);

    if (error) {
      if (uploadedImagePath) {
        await supabase.storage.from(productImagesBucket).remove([uploadedImagePath]);
      }

      redirect(`/products?error=${encodeURIComponent(`No se pudo crear el producto: ${formatSupabaseError(error)}`)}`);
    }

    revalidatePath("/products");
    redirect("/products?success=Producto%20creado%20correctamente");
  }

  async function updateProductAction(formData: FormData) {
    "use server";

    const { supabase, membership } = await requireViewerContext();
    const productId = readRequiredString(formData, "product_id");
    const currentName = readRequiredString(formData, "current_name");
    const currentReferenceImage = readRequiredString(formData, "current_reference_image") || null;

    if (!membership) {
      redirect("/products?error=No%20tienes%20un%20negocio%20asignado");
    }

    if (!productEditors.has(membership.role)) {
      redirect("/products?error=No%20tienes%20permisos%20para%20editar%20productos");
    }

    let payload: TablesUpdate<"products">;
    let imageFile: File | null = null;

    try {
      imageFile = readOptionalImageFile(formData, "reference_image_file");
      payload = parseProductPayload(formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo validar el formulario.";
      redirect(`/products?error=${encodeURIComponent(message)}`);
    }

    if (imageFile) {
      const nextReferenceImage = buildProductImagePath(membership.business_id, payload.name ?? currentName, imageFile);

      const { error: uploadError } = await supabase.storage.from(productImagesBucket).upload(nextReferenceImage, imageFile, {
        upsert: true,
        contentType: imageFile.type,
      });

      if (uploadError) {
        redirect(`/products?error=${encodeURIComponent(`No se pudo actualizar la imagen: ${uploadError.message}`)}`);
      }

      if (currentReferenceImage && currentReferenceImage !== nextReferenceImage) {
        await supabase.storage.from(productImagesBucket).remove([currentReferenceImage]);
      }

      payload.reference_image = nextReferenceImage;
    } else if (currentReferenceImage && payload.name && payload.name !== currentName) {
      const renamedReferenceImage = renameProductImagePath(currentReferenceImage, payload.name);

      if (renamedReferenceImage !== currentReferenceImage) {
        const { error: moveError } = await supabase.storage
          .from(productImagesBucket)
          .move(currentReferenceImage, renamedReferenceImage);

        if (moveError) {
          redirect(`/products?error=${encodeURIComponent(`No se pudo renombrar la imagen actual: ${moveError.message}`)}`);
        }

        payload.reference_image = renamedReferenceImage;
      }
    }

    if (payload.name && payload.name !== currentName) {
      const { data: existingProduct } = await supabase
        .from("products")
        .select("id")
        .eq("business_id", membership.business_id)
        .eq("name", payload.name)
        .neq("id", productId)
        .maybeSingle();

      if (existingProduct) {
        redirect("/products?error=Ya%20existe%20otro%20producto%20con%20ese%20nombre");
      }
    }

    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", productId)
      .eq("business_id", membership.business_id);

    if (error) {
      redirect(`/products?error=${encodeURIComponent(`No se pudo actualizar el producto: ${formatSupabaseError(error)}`)}`);
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
    <PageSkeleton name="products-page">
      <main className="px-4 pb-28 pt-6">
        <div className="mx-auto w-full max-w-md space-y-5">
          <ProductsStatusToast success={params.success} error={params.error} />

          <AppTopbar
            eyebrow="Catalogo"
            title="Productos"
            description={`${businessName} · Organiza lo que vendes`}
            rightSlot={
              <Link
                href="/"
                className="transition hover:brightness-105"
                aria-label="Volver al dashboard"
              >
                <Image
                  src="/logo.png"
                  alt="Tony's Kitchen Ops"
                  width={120}
                  height={120}
                  className="h-[5.75rem] w-[5.75rem] object-contain object-center"
                  unoptimized
                />
              </Link>
            }
          />

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
    </PageSkeleton>
  );
}
