"use client"

import type { BookingData } from "@/components/booking-wizard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, Briefcase, DollarSign } from "lucide-react"

interface StepConfirmationProps {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
}

export function StepConfirmation({ bookingData, updateBookingData }: StepConfirmationProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Confirme os Dados</h3>
        <p className="text-sm text-muted-foreground">Revise as informações e preencha os dados do cliente</p>
      </div>

      {/* Booking Summary */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-medium text-foreground mb-4">Resumo do Agendamento</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Serviço:</span>
            <span className="font-medium text-foreground">{bookingData.serviceName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Profissional:</span>
            <span className="font-medium text-foreground">{bookingData.professionalName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Data:</span>
            <span className="font-medium text-foreground">{formatDate(bookingData.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Horário:</span>
            <span className="font-medium text-foreground">{bookingData.time}</span>
          </div>
          <Separator />
          <div className="flex items-center gap-3 text-sm">
            <DollarSign className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Valor:</span>
            <span className="font-semibold text-accent">{formatPrice(bookingData.servicePrice)}</span>
          </div>
        </div>
      </Card>

      {/* Client Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Dados do Cliente</h4>

        <div className="space-y-2">
          <Label htmlFor="clientName">Nome Completo *</Label>
          <Input
            id="clientName"
            value={bookingData.clientName}
            onChange={(e) => updateBookingData({ clientName: e.target.value })}
            placeholder="Nome do cliente"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={bookingData.clientEmail}
              onChange={(e) => updateBookingData({ clientEmail: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">Telefone *</Label>
            <Input
              id="clientPhone"
              type="tel"
              value={bookingData.clientPhone}
              onChange={(e) => updateBookingData({ clientPhone: e.target.value })}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={bookingData.notes}
            onChange={(e) => updateBookingData({ notes: e.target.value })}
            placeholder="Informações adicionais..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
