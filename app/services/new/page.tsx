import { requireAuth } from "@/lib/auth"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceForm } from "@/components/service-form"

export default async function NewServicePage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <NavHeader userName={user.name} />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Novo Serviço</h2>
          <p className="text-muted-foreground">Cadastre um novo serviço no sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Serviço</CardTitle>
            <CardDescription>Preencha os dados do serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceForm />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
