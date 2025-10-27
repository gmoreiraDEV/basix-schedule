"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StepService } from "@/components/booking-wizard/step-service"
import { StepProfessional } from "@/components/booking-wizard/step-professional"
import { StepDateTime } from "@/components/booking-wizard/step-datetime"
import { StepConfirmation } from "@/components/booking-wizard/step-confirmation"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface BookingData {
  serviceId: string
  serviceName: string
  serviceDuration: number
  servicePrice: number
  professionalId: string
  professionalName: string
  date: Date | null
  time: string
  clientName: string
  clientEmail: string
  clientPhone: string
  notes: string
}

export function BookingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: "",
    serviceName: "",
    serviceDuration: 0,
    servicePrice: 0,
    professionalId: "",
    professionalName: "",
    date: null,
    time: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return bookingData.serviceId !== ""
      case 2:
        return bookingData.professionalId !== ""
      case 3:
        return bookingData.date !== null && bookingData.time !== ""
      case 4:
        return bookingData.clientName !== "" && bookingData.clientPhone !== ""
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    console.log("[v0] Booking submitted:", bookingData)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/bookings")
  }

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Passo {currentStep} de {totalSteps}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {[
          { num: 1, label: "Serviço" },
          { num: 2, label: "Profissional" },
          { num: 3, label: "Data/Hora" },
          { num: 4, label: "Confirmação" },
        ].map((step) => (
          <div key={step.num} className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep >= step.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {step.num}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] py-6">
        {currentStep === 1 && <StepService bookingData={bookingData} updateBookingData={updateBookingData} />}
        {currentStep === 2 && <StepProfessional bookingData={bookingData} updateBookingData={updateBookingData} />}
        {currentStep === 3 && <StepDateTime bookingData={bookingData} updateBookingData={updateBookingData} />}
        {currentStep === 4 && <StepConfirmation bookingData={bookingData} updateBookingData={updateBookingData} />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNext} disabled={!canGoNext()}>
            Próximo
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canGoNext()}>
            Confirmar Agendamento
          </Button>
        )}
      </div>
    </div>
  )
}
