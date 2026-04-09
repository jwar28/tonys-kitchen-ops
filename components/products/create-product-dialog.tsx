"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Enums } from "@/database.types";
import { Plus } from "lucide-react";

type ProductCategory = Enums<"product_category">;

type CreateProductDialogProps = {
  action: (formData: FormData) => void | Promise<void>;
  categories: Array<{
    value: ProductCategory;
    label: string;
  }>;
};

export function CreateProductDialog({ action, categories }: CreateProductDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-28 right-4 z-30 size-16 rounded-full border border-white/30 bg-primary text-primary-foreground shadow-[0_24px_48px_-20px_rgba(145,30,20,0.95)] transition hover:scale-[1.02] hover:brightness-105 sm:right-6"
          aria-label="Crear nuevo producto"
        >
          <Plus className="size-7" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[2rem] border-white/40 bg-[linear-gradient(180deg,rgba(255,248,243,0.98),rgba(255,255,255,0.97))] p-0 shadow-[0_32px_80px_-44px_rgba(0,0,0,0.75)] sm:max-w-md">
        <div className="overflow-hidden rounded-[2rem]">
          <DialogHeader className="border-b border-primary/10 px-5 pb-4 pt-6 text-left">
            <DialogTitle className="text-2xl tracking-tight text-foreground">Nuevo producto</DialogTitle>
            <DialogDescription className="text-sm">
              Agrega un item al catalogo con precio, costo y orden de aparicion.
            </DialogDescription>
          </DialogHeader>

          <form action={action} className="space-y-4 px-5 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="create-name" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                Nombre
              </Label>
              <Input
                id="create-name"
                name="name"
                placeholder="Ej. Papa rellena especial"
                required
                className="h-12 rounded-2xl border-white/60 bg-white/90"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="create-category" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                  Categoria
                </Label>
                <select
                  id="create-category"
                  name="category"
                  defaultValue="otro"
                  className="flex h-12 w-full rounded-2xl border border-input bg-white/90 px-3 text-sm outline-none ring-offset-background focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {categories.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-unit" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                  Unidad
                </Label>
                <Input
                  id="create-unit"
                  name="unit"
                  defaultValue="unidad"
                  placeholder="unidad, porcion, botella"
                  required
                  className="h-12 rounded-2xl border-white/60 bg-white/90"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-sale-price" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                  Precio de venta
                </Label>
                <Input
                  id="create-sale-price"
                  name="sale_price"
                  type="number"
                  min="0"
                  step="100"
                  required
                  className="h-12 rounded-2xl border-white/60 bg-white/90"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-cost-price" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                  Costo
                </Label>
                <Input
                  id="create-cost-price"
                  name="cost_price"
                  type="number"
                  min="0"
                  step="100"
                  required
                  className="h-12 rounded-2xl border-white/60 bg-white/90"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-sort-order" className="pl-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                Orden visual
              </Label>
              <Input
                id="create-sort-order"
                name="sort_order"
                type="number"
                min="0"
                step="1"
                defaultValue={0}
                className="h-12 rounded-2xl border-white/60 bg-white/90"
              />
            </div>

            <Button type="submit" className="h-12 w-full rounded-2xl">
              Crear producto
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
