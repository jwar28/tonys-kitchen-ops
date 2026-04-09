export default function Loading() {
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

        <div className="h-28 rounded-2xl bg-card" />
        <div className="h-36 rounded-2xl bg-card" />
      </div>
    </main>
  );
}
