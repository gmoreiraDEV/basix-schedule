import { requireAuth } from "@/lib/auth"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Briefcase, Clock } from "lucide-react"
import Link from "next/link"
import { mockBookings, mockServices, mockProfessionals } from "@/lib/mock-data"

export default async function DashboardPage() {
  const user = await requireAuth()

  // Calculate stats
  const todayBookings = mockBookings.filter((b) => {
    const today = new Date()
    const bookingDate = new Date(b.startTime)
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    )
  })

  const upcomingBookings = mockBookings
    .filter((b) => new Date(b.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <NavHeader userName={user.name} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do sistema de agendamento</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayBookings.length}</div>
              <p className="text-xs text-muted-foreground">Confirmados para hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockBookings.length}</div>
              <p className="text-xs text-muted-foreground">No sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockServices.filter((s) => s.active).length}</div>
              <p className="text-xs text-muted-foreground">Disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockProfessionals.filter((p) => p.active).length}</div>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-auto py-4 flex-col gap-2">
                <Link href="/book">
                  <Calendar className="h-6 w-6" />
                  <span>Novo Agendamento</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                <Link href="/bookings">
                  <Clock className="h-6 w-6" />
                  <span>Ver Agendamentos</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                <Link href="/services">
                  <Briefcase className="h-6 w-6" />
                  <span>Gerenciar Serviços</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                <Link href="/professionals">
                  <Users className="h-6 w-6" />
                  <span>Gerenciar Profissionais</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>Agendamentos confirmados</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento próximo</p>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => {
                  const service = mockServices.find((s) => s.id === booking.serviceId)
                  const professional = mockProfessionals.find((p) => p.id === booking.professionalId)
                  const startTime = new Date(booking.startTime)

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{booking.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {service?.name} • {professional?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {startTime.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
