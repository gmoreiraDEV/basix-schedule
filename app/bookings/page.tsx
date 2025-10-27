import { requireAuth } from "@/lib/auth"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { BookingsTable } from "@/components/bookings-table"
import { BookingsStats } from "@/components/bookings-stats"

export default async function BookingsPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <NavHeader userName={user.name} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Agendamentos</h2>
            <p className="text-muted-foreground">Gerencie todos os agendamentos do sistema</p>
          </div>
          <Button asChild>
            <Link href="/book">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Link>
          </Button>
        </div>

        <BookingsStats />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Lista de Agendamentos</CardTitle>
            <CardDescription>Todos os agendamentos cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingsTable />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
