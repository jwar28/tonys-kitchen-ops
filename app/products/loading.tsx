import { ProductsPageSkeleton } from "@/components/loading/products-page-skeleton";
import { Suspense } from "react";

export default function Loading() {
  return (
    <Suspense fallback={null}>
      <ProductsPageSkeleton />
    </Suspense>
  );
}
