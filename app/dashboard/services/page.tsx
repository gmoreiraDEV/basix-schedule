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
import { ServicesTable } from "@/components/services-table";

export default async function ServicesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Serviços</h2>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/services/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>
            Todos os serviços cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServicesTable />
        </CardContent>
      </Card>
    </main>
  );
}
