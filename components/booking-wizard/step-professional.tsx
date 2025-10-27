"use client"

import type { BookingData } from "@/components/booking-wizard"
import { mockProfessionals, mockServiceProfessionals } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Check, User } from "lucide-react"

interface StepProfessionalProps {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
}

export function StepProfessional({ bookingData, updateBookingData }: StepProfessionalProps) {
  // Filter professionals who can perform the selected service
  const availableProfessionals = mockProfessionals.filter((prof) => {
    if (!prof.active) return false
    return mockServiceProfessionals.some(
      (sp) => sp.professionalId === prof.id && sp.serviceId === bookingData.serviceId,
    )
  })

  const handleSelectProfessional = (professional: (typeof mockProfessionals)[0]) => {
    updateBookingData({
      professionalId: professional.id,
      professionalName: professional.name,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Selecione o Profissional</h3>
        <p className="text-sm text-muted-foreground">
          Escolha o profissional que realizará o serviço: <strong>{bookingData.serviceName}</strong>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {availableProfessionals.map((professional) => {
          const isSelected = bookingData.professionalId === professional.id

          return (
            <Card
              key={professional.id}
              className={`relative cursor-pointer transition-all hover:border-primary ${
                isSelected ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => handleSelectProfessional(professional)}
            >
              <div className="p-4">
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{professional.name}</h4>
                    {professional.email && <p className="text-sm text-muted-foreground">{professional.email}</p>}
                    {professional.phone && <p className="text-sm text-muted-foreground mt-1">{professional.phone}</p>}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {availableProfessionals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum profissional disponível para este serviço</p>
        </div>
      )}
    </div>
  )
}
