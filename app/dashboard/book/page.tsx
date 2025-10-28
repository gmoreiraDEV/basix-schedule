import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookingWizard } from "@/components/booking-wizard";

export default async function BookPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Novo Agendamento
        </h2>
        <p className="text-muted-foreground">
          Siga os passos para criar um novo agendamento
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wizard de Agendamento</CardTitle>
          <CardDescription>
            Complete as etapas para finalizar o agendamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingWizard />
        </CardContent>
      </Card>
    </main>
  );
}
