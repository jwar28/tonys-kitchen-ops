import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center p-4">
      <Card className="w-full rounded-3xl border-border/70 bg-card/95">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl tracking-tight">Recuperar contrasena</CardTitle>
          <CardDescription>
            Esta pantalla estara activa pronto. Por ahora, vuelve al login principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="block">
            <Button className="w-full">Volver al login</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
