"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Enums, Tables } from "@/database.types";
import { cn } from "@/lib/utils";
import { FolderOpen, Funnel, Package, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";

type ProductRow = Tables<"products">;
type ProductCategory = Enums<"product_category">;
type StatusFilter = "active" | "inactive" | "all";
type CategoryFilter = ProductCategory | "all";

type ProductsCatalogProps = {
  currencyCode: string;
  initialCategoryFilter: CategoryFilter;
  initialStatusFilter: StatusFilter;
  products: ProductRow[];
  categoryOptions: Array<{
    value: ProductCategory;
    label: string;
    tone: string;
  }>;
  updateProductAction: (formData: FormData) => void | Promise<void>;
  toggleProductAction: (formData: FormData) => void | Promise<void>;
};

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

export function ProductsCatalog({
  currencyCode,
  initialCategoryFilter,
  initialStatusFilter,
  products,
  categoryOptions,
  updateProductAction,
  toggleProductAction,
}: ProductsCatalogProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(initialCategoryFilter);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);

  const getCategoryMeta = (category: ProductCategory) =>
    categoryOptions.find((option) => option.value === category) ?? categoryOptions[3];

  const filteredProducts = products.filter((product) => {
    const statusMatches =
      statusFilter === "all" ? true : statusFilter === "active" ? product.is_active : !product.is_active;
    const categoryMatches = categoryFilter === "all" ? true : product.category === categoryFilter;

    return statusMatches && categoryMatches;
  });

  const statusLabel = statusFilter === "active" ? "Activos" : statusFilter === "inactive" ? "Inactivos" : "Todos";
  const categoryLabel = categoryFilter === "all" ? "Todas" : getCategoryMeta(categoryFilter).label;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Listado</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "producto encontrado" : "productos encontrados"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
            {statusFilter === "active" ? "Vista activa" : statusFilter === "inactive" ? "Vista inactiva" : "Vista completa"}
          </Badge>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full border-white/60 bg-white/85 shadow-sm">
                <Funnel className="size-4" />
                <span className="sr-only">Abrir filtros</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[20rem] rounded-[1.5rem] border-white/60 bg-[linear-gradient(180deg,rgba(255,251,247,0.98),rgba(255,255,255,0.98))] p-4 shadow-[0_24px_50px_-36px_rgba(0,0,0,0.65)]">
              <PopoverHeader className="border-b border-border/70 pb-3">
                <PopoverTitle className="text-base font-semibold tracking-tight">Filtros</PopoverTitle>
                <PopoverDescription className="text-xs">
                  Estado: {statusLabel} · Categoria: {categoryLabel}
                </PopoverDescription>
              </PopoverHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">Estado</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "active", label: "Activos" },
                      { value: "inactive", label: "Inactivos" },
                      { value: "all", label: "Todos" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={statusFilter === option.value ? "default" : "outline"}
                        className="rounded-full"
                        size="sm"
                        onClick={() => setStatusFilter(option.value as StatusFilter)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">Categoria</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={categoryFilter === "all" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setCategoryFilter("all")}
                    >
                      Todas
                    </Button>
                    {categoryOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={categoryFilter === option.value ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setCategoryFilter(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => {
          const category = getCategoryMeta(product.category);
          const profit = product.sale_price - product.cost_price;

          return (
            <Card key={product.id} className="overflow-hidden rounded-[1.8rem] border-border/65 bg-card/95 shadow-[0_24px_50px_-42px_rgba(0,0,0,0.55)]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-tight">{product.name}</h3>
                      <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em]", category.tone)}>
                        {category.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em]",
                          product.is_active
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : "border-stone-300 bg-stone-100 text-stone-700",
                        )}
                      >
                        {product.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Se vende por {product.unit}.
                    </p>
                  </div>
                  <div className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">
                    <Package className="size-5" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-secondary/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/55">Venta</p>
                    <p className="mt-1 text-sm font-semibold">{formatCurrency(product.sale_price, currencyCode)}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/55">Costo</p>
                    <p className="mt-1 text-sm font-semibold">{formatCurrency(product.cost_price, currencyCode)}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/60 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/55">Ganancia</p>
                    <p className="mt-1 text-sm font-semibold">{formatCurrency(profit, currencyCode)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setEditingProduct(product)}
                  >
                      <Pencil className="size-3.5" />
                      Editar
                  </Button>

                  <form action={toggleProductAction}>
                    <input type="hidden" name="product_id" value={product.id} />
                    <input type="hidden" name="next_status" value={String(!product.is_active)} />
                    <Button variant="secondary" size="sm" className="rounded-full">
                      {product.is_active ? <ToggleLeft className="size-3.5" /> : <ToggleRight className="size-3.5" />}
                      {product.is_active ? "Desactivar" : "Reactivar"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card className="rounded-[1.8rem] border-dashed border-border/80 bg-card/80">
          <CardContent className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
              <FolderOpen className="size-6" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">No hay productos con este filtro</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajusta los filtros o crea tu primer producto para empezar a venderlo en la operacion diaria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[2rem] border-white/40 bg-[linear-gradient(180deg,rgba(255,248,243,0.98),rgba(255,255,255,0.97))] p-0 shadow-[0_32px_80px_-44px_rgba(0,0,0,0.75)] sm:max-w-md">
          <div className="overflow-hidden rounded-[2rem]">
            <DialogHeader className="border-b border-primary/10 px-5 pb-4 pt-6 text-left">
              <DialogTitle className="text-2xl tracking-tight text-foreground">Editar producto</DialogTitle>
              <DialogDescription className="text-sm">
                Ajusta nombre, categoria, precios y orden del producto seleccionado.
              </DialogDescription>
            </DialogHeader>

            {editingProduct ? (
              <form action={updateProductAction} className="space-y-4 px-5 py-5">
                <input type="hidden" name="product_id" value={editingProduct.id} />

                <div className="space-y-1.5">
                  <Label htmlFor="edit-name" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                    Nombre
                  </Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingProduct.name}
                    required
                    className="h-12 rounded-2xl border-white/60 bg-white/90"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-category" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                      Categoria
                    </Label>
                    <select
                      id="edit-category"
                      name="category"
                      defaultValue={editingProduct.category}
                      className="flex h-12 w-full rounded-2xl border border-input bg-white/90 px-3 text-sm outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-unit" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                      Unidad
                    </Label>
                    <Input
                      id="edit-unit"
                      name="unit"
                      defaultValue={editingProduct.unit}
                      required
                      className="h-12 rounded-2xl border-white/60 bg-white/90"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-sale-price" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                      Precio de venta
                    </Label>
                    <Input
                      id="edit-sale-price"
                      name="sale_price"
                      type="number"
                      min="0"
                      step="100"
                      defaultValue={editingProduct.sale_price}
                      required
                      className="h-12 rounded-2xl border-white/60 bg-white/90"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-cost-price" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                      Costo
                    </Label>
                    <Input
                      id="edit-cost-price"
                      name="cost_price"
                      type="number"
                      min="0"
                      step="100"
                      defaultValue={editingProduct.cost_price}
                      required
                      className="h-12 rounded-2xl border-white/60 bg-white/90"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-sort-order" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                    Orden visual
                  </Label>
                  <Input
                    id="edit-sort-order"
                    name="sort_order"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={editingProduct.sort_order}
                    className="h-12 rounded-2xl border-white/60 bg-white/90"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="h-12 flex-1 rounded-2xl">
                    Guardar cambios
                  </Button>
                  <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={() => setEditingProduct(null)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
