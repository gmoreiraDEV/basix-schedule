import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProfessionalsTable } from "@/components/professionals-table";

export default async function ProfessionalsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Profissionais
          </h2>
          <p className="text-muted-foreground">
            Gerencie os profissionais do sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/professionals/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Profissional
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Profissionais</CardTitle>
          <CardDescription>
            Todos os profissionais cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfessionalsTable />
        </CardContent>
      </Card>
    </main>
  );
}
