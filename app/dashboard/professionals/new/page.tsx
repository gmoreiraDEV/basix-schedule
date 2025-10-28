import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfessionalForm } from "@/components/professional-form";

export default async function NewProfessionalPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Novo Profissional
        </h2>
        <p className="text-muted-foreground">
          Cadastre um novo profissional no sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Profissional</CardTitle>
          <CardDescription>Preencha os dados do profissional</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfessionalForm />
        </CardContent>
      </Card>
    </main>
  );
}
