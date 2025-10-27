"use client"

import { useEffect, useState } from "react"
import type { BookingData } from "@/components/booking-wizard"
import { Card } from "@/components/ui/card"
import { Check, Clock, DollarSign } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  active: boolean
}

interface StepServiceProps {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
}

export function StepService({ bookingData, updateBookingData }: StepServiceProps) {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data.filter((s: Service) => s.active)))
      .catch((err) => console.error("[v0] Error fetching services:", err))
  }, [])

  const handleSelectService = (service: Service) => {
    updateBookingData({
      serviceId: service.id,
      serviceName: service.name,
      serviceDuration: service.duration,
      servicePrice: service.price,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Selecione o Serviço</h3>
        <p className="text-sm text-muted-foreground">Escolha o serviço que deseja agendar</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => {
          const isSelected = bookingData.serviceId === service.id

          return (
            <Card
              key={service.id}
              className={`relative cursor-pointer transition-all hover:border-primary ${
                isSelected ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => handleSelectService(service)}
            >
              <div className="p-4">
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <h4 className="font-semibold text-foreground mb-2">{service.name}</h4>
                {service.description && <p className="text-sm text-muted-foreground mb-4">{service.description}</p>}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-accent font-medium">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatPrice(service.price)}</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum serviço disponível no momento</p>
        </div>
      )}
    </div>
  )
}
