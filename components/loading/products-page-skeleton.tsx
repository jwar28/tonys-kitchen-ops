"use client";

import { PageSkeleton } from "@/components/loading/page-skeleton";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export function ProductsPageSkeleton() {
  return (
    <PageSkeleton name="products-page" loading>
      <main className="px-4 pb-28 pt-6">
        <div className="mx-auto w-full max-w-md space-y-5">
          <section className="rounded-[1.7rem] border border-white/45 bg-[linear-gradient(180deg,rgba(255,251,247,0.95),rgba(244,236,227,0.92))] px-4 py-3 shadow-[0_22px_55px_-42px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <div className="h-3 w-20 rounded-full bg-secondary/80" />
                <div className="h-10 w-40 rounded-2xl bg-secondary/80" />
                <div className="h-4 w-52 rounded-full bg-secondary/60" />
              </div>
              <div className="h-[5.75rem] w-[5.75rem] rounded-full bg-secondary/70" />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[1.6rem] border border-border/60 bg-card/95 p-4">
                <div className="space-y-2">
                  <div className="h-4 w-4 rounded-full bg-secondary/80" />
                  <div className="h-3 w-16 rounded-full bg-secondary/60" />
                  <div className="h-8 w-20 rounded-2xl bg-secondary/80" />
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-8 w-28 rounded-2xl bg-secondary/80" />
                <div className="h-4 w-36 rounded-full bg-secondary/60" />
              </div>
              <div className="h-10 w-10 rounded-full bg-secondary/70" />
            </div>

            <div className="h-12 rounded-[1.2rem] bg-card/90" />

            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[1.8rem] border border-border/65 bg-card/95 p-4 shadow-[0_24px_50px_-42px_rgba(0,0,0,0.55)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="h-[5.5rem] w-[5.75rem] rounded-[1.55rem] bg-secondary/70" />
                    <div className="min-w-0 space-y-2">
                      <div className="h-7 w-24 rounded-2xl bg-secondary/80" />
                      <div className="flex gap-2">
                        <div className="h-6 w-16 rounded-full bg-secondary/60" />
                        <div className="h-6 w-16 rounded-full bg-secondary/60" />
                      </div>
                      <div className="h-4 w-28 rounded-full bg-secondary/60" />
                    </div>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-secondary/70" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, metricIndex) => (
                    <div key={metricIndex} className="rounded-2xl bg-secondary/60 px-3 py-2.5">
                      <div className="h-3 w-12 rounded-full bg-white/60" />
                      <div className="mt-2 h-5 w-16 rounded-2xl bg-white/70" />
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <div className="h-9 w-24 rounded-full bg-secondary/70" />
                  <div className="h-9 w-28 rounded-full bg-secondary/70" />
                </div>
              </div>
            ))}
          </section>
        </div>

        <MobileBottomNav active="products" />
      </main>
    </PageSkeleton>
  );
}
