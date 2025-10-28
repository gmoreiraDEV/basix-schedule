import { requireAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServiceForm } from "@/components/service-form";
import prisma from "@/lib/db";

export default async function EditServicePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await requireAuth();

  // ✅ busca direta pelo Prisma — sem fetch, sem erro de auth
  const service = await prisma.service.findUnique({
    where: { id, organizationId: user.organizationId },
  });

  if (!service) {
    return <p className="p-8 text-red-500">Serviço não encontrado.</p>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Editar Serviço
        </h2>
        <p className="text-muted-foreground">Editar serviço no sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Serviço</CardTitle>
          <CardDescription>Preencha os dados do serviço</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm service={service} id={id} />
        </CardContent>
      </Card>
    </main>
  );
}
