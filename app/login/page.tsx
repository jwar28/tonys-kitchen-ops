import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/utils";
import { Eye, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  if (!hasSupabaseEnv) {
    return (
      <main className="fixed inset-0 overflow-hidden px-4 py-4 sm:px-6 md:px-10">
        <div className="flex min-h-full items-center justify-center">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-3 flex flex-col items-center text-center">
              <div className="relative mb-2 grid size-24 place-items-center overflow-hidden rounded-full sm:size-28">
              <Image src="/logo.png" alt="Tony's Delicious" fill className="object-cover" priority unoptimized />
              </div>
              <h1 className="text-[2rem] font-semibold tracking-tight text-primary sm:text-4xl">Tony&apos;s Kitchen Ops</h1>
            </div>

            <Card className="rounded-[1.8rem] border border-white/40 bg-[#f1f1f1]/95 px-4 py-4 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:px-6 sm:py-6">
              <CardHeader className="space-y-1 p-0">
                <CardTitle className="text-[1.75rem] tracking-tight text-foreground sm:text-3xl">Configura Supabase</CardTitle>
                <CardDescription className="text-xs text-foreground/65">
                  Antes de iniciar sesion, agrega las variables del proyecto en `.env.local`.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 p-0 pt-4 text-sm text-muted-foreground">
                <div className="rounded-[1.3rem] border border-primary/10 bg-primary/5 px-4 py-3 font-mono text-xs text-foreground/80">
                  NEXT_PUBLIC_SUPABASE_URL=...
                  <br />
                  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
                </div>
                <p>Encuentras estos valores en Supabase: Settings &gt; API.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function loginAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      redirect("/login?error=Completa%20correo%20y%20contrasena");
    }

    const supabaseForAction = await createClient();
    const { error } = await supabaseForAction.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      redirect("/login?error=Credenciales%20invalidas");
    }

    redirect("/");
  }

  if (user) {
    redirect("/");
  }

  return (
    <main className="fixed inset-0 overflow-hidden px-4 py-4 sm:px-6 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_5%,hsl(8_76%_47%/_0.12),transparent_34%),radial-gradient(circle_at_95%_80%,hsl(18_85%_50%/_0.08),transparent_40%)]" />

      <div className="relative flex min-h-full items-center justify-center">
        <div className="mx-auto w-full max-w-md">
        <div className="mb-3 flex flex-col items-center text-center">
          <div className="relative mb-2 grid size-24 place-items-center overflow-hidden rounded-full sm:size-28">
            <Image src="/logo.png" alt="Tony's Delicious" fill className="object-cover" priority unoptimized />
          </div>
          <h1 className="text-[2rem] font-semibold tracking-tight text-primary sm:text-4xl">Tony&apos;s Kitchen Ops</h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/60">Autenticidad en cada detalle</p>
        </div>

        <Card className="rounded-[1.8rem] border border-white/40 bg-[#f1f1f1]/95 px-4 py-4 shadow-[0_26px_70px_-42px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:px-6 sm:py-6">
          <CardHeader className="space-y-1 p-0">
            <CardTitle className="text-[1.75rem] tracking-tight text-foreground sm:text-3xl">Bienvenido</CardTitle>
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
      </div>
    </main>
  );
}
