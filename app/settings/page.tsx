import { requireAuth } from "@/lib/auth"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScheduleRulesManager } from "@/components/schedule-rules-manager"
import { BlocksManager } from "@/components/blocks-manager"

export default async function SettingsPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <NavHeader userName={user.name} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Configurações</h2>
          <p className="text-muted-foreground">Gerencie horários de trabalho e bloqueios</p>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList>
            <TabsTrigger value="schedule">Horários de Trabalho</TabsTrigger>
            <TabsTrigger value="blocks">Bloqueios</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Horários de Trabalho</CardTitle>
                <CardDescription>
                  Configure os horários de trabalho de cada profissional por dia da semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduleRulesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocks">
            <Card>
              <CardHeader>
                <CardTitle>Bloqueios de Agenda</CardTitle>
                <CardDescription>Bloqueie períodos específicos na agenda dos profissionais</CardDescription>
              </CardHeader>
              <CardContent>
                <BlocksManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
