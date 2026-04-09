"use client";

import { PageSkeleton } from "@/components/loading/page-skeleton";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export function DashboardPageSkeleton() {
  return (
    <PageSkeleton name="dashboard-page" loading>
      <main className="px-4 pb-28 pt-6">
        <div className="mx-auto w-full max-w-md space-y-5">
          <section className="rounded-[1.7rem] border border-white/45 bg-[linear-gradient(180deg,rgba(255,251,247,0.95),rgba(244,236,227,0.92))] px-4 py-3 shadow-[0_22px_55px_-42px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <div className="h-3 w-24 rounded-full bg-secondary/80" />
                <div className="h-10 w-44 rounded-2xl bg-secondary/80" />
                <div className="h-4 w-56 rounded-full bg-secondary/60" />
              </div>
              <div className="h-[5.75rem] w-[5.75rem] rounded-full bg-secondary/70" />
            </div>
          </section>

          <section className="rounded-2xl border border-amber-300/30 bg-card/85 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-secondary/70" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-5 w-48 rounded-full bg-secondary/80" />
                <div className="h-4 w-60 rounded-full bg-secondary/60" />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="h-8 w-48 rounded-2xl bg-secondary/80" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border/60 bg-card/95 p-4">
                  <div className="space-y-2">
                    <div className="h-4 w-4 rounded-full bg-secondary/80" />
                    <div className="h-3 w-16 rounded-full bg-secondary/60" />
                    <div className="h-8 w-20 rounded-2xl bg-secondary/80" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="h-8 w-44 rounded-2xl bg-secondary/80" />
            <div className="rounded-2xl border border-border/60 bg-card/95 p-4">
              <div className="space-y-3">
                <div className="h-7 w-40 rounded-2xl bg-secondary/80" />
                <div className="h-4 w-56 rounded-full bg-secondary/60" />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="h-8 w-36 rounded-2xl bg-secondary/80" />
            <div className="rounded-2xl border border-border/60 bg-card/95 p-4">
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-4 w-28 rounded-full bg-secondary/70" />
                      <div className="h-4 w-10 rounded-full bg-secondary/60" />
                    </div>
                    <div className="h-2 rounded-full bg-secondary/60" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <MobileBottomNav active="dashboard" />
      </main>
    </PageSkeleton>
  );
}
