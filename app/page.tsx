import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { Eye, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

type HomePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function loginAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      redirect("/?error=Completa%20correo%20y%20contrasena");
    }

    const supabaseForAction = await createClient();
    const { error } = await supabaseForAction.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      redirect("/?error=Credenciales%20invalidas");
    }

    redirect("/");
  }

  async function signOutAction() {
    "use server";
    const supabaseForAction = await createClient();
    await supabaseForAction.auth.signOut();
    redirect("/");
  }

  if (!user) {
    return (
      <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-4 sm:px-6 md:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_5%,hsl(8_76%_47%/_0.12),transparent_34%),radial-gradient(circle_at_95%_80%,hsl(18_85%_50%/_0.08),transparent_40%)]" />

        <div className="mx-auto w-full max-w-md">
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="relative mb-3 grid size-28 place-items-center overflow-hidden rounded-md bg-primary shadow-[0_18px_34px_-18px_rgba(160,41,25,0.85)]">
              <Image src="/logo.png" alt="Tony's Delicious" fill className="object-cover" priority />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-primary">Tony&apos;s Kitchen Ops</h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/60">Autenticidad en cada detalle</p>
          </div>

          <Card className="rounded-[1.8rem] border border-white/40 bg-[#f1f1f1]/95 px-4 py-4 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:px-6 sm:py-6">
            <CardHeader className="space-y-1 p-0">
              <CardTitle className="text-3xl tracking-tight text-foreground">Bienvenido</CardTitle>
              <CardDescription className="text-xs text-foreground/65">Ingresa para abrir tu panel.</CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-4">
              <form action={loginAction} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="pl-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">
                    Correo
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-[#9b7f75]" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      className="h-12 rounded-xl border-[#e7d8c8] bg-[#eee4d6] pl-10 pr-3 text-sm placeholder:text-[#bcaea1] focus-visible:ring-1 focus-visible:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="pl-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">
                    Contrasena
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-[#9b7f75]" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="h-12 rounded-xl border-[#e7d8c8] bg-[#eee4d6] pl-10 pr-10 text-sm placeholder:text-[#bcaea1] focus-visible:ring-1 focus-visible:ring-primary/40"
                    />
                    <Eye className="pointer-events-none absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-[#9b7f75]" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-primary/90 transition hover:text-primary">
                    Olvidaste tu contrasena?
                  </Link>
                </div>

                {error ? (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" className="h-11 w-full rounded-xl bg-gradient-to-r from-primary to-[hsl(2_74%_40%)] text-xl font-semibold tracking-tight text-primary-foreground shadow-[0_14px_30px_-18px_rgba(145,30,20,0.95)] transition hover:brightness-105">
                  Ingresar
                </Button>

                <div className="pt-1">
                  <div className="h-px bg-border/60" />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl place-items-center">
        <Card className="w-full max-w-2xl border-border/70 bg-card/95 shadow-[0_18px_55px_-25px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <CardHeader className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative size-16 overflow-hidden rounded-full border-2 border-primary/40">
                <Image src="/logo.jpeg" alt="Tony's Delicious" fill className="object-cover" priority />
              </div>
              <div>
                <CardTitle className="text-2xl tracking-tight">Kitchen Ops</CardTitle>
                <CardDescription className="text-sm">
                  Gestion diaria para fritos y pizzas con estilo limpio y minimalista.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
              <p className="text-sm text-muted-foreground">Sesion activa</p>
              <p className="mt-1 text-base font-medium">{user.email}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Ventas del dia</p>
                <p className="text-lg font-semibold">$0</p>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Unidades vendidas</p>
                <p className="text-lg font-semibold">0</p>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-3">
                <p className="text-xs text-muted-foreground">Utilidad estimada</p>
                <p className="text-lg font-semibold">$0</p>
              </div>
            </div>

            <form action={signOutAction}>
              <Button type="submit" variant="outline" className="w-full sm:w-auto">
                Cerrar sesion
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
