"use client";

import { useEffect, useState } from "react";
import type { BookingData } from "@/components/booking-wizard";
import { Card } from "@/components/ui/card";
import { Check, User } from "lucide-react";

interface Professional {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
}

interface StepProfessionalProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
}

export function StepProfessional({
  bookingData,
  updateBookingData,
}: StepProfessionalProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    if (bookingData.serviceId) {
      fetch(`/api/professionals/${bookingData.serviceId}/services`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setProfessionals(data);
          return "";
        })
        .catch((err) =>
          console.error("[v0] Error fetching professionals:", err)
        );
    }
  }, [bookingData.serviceId]);

  const handleSelectProfessional = (professional: Professional) => {
    updateBookingData({
      professionalId: professional.id,
      professionalName: professional.name,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Selecione o Profissional
        </h3>
        <p className="text-sm text-muted-foreground">
          Escolha o profissional que realizará o serviço:{" "}
          <strong>{bookingData.serviceName}</strong>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {professionals.map((professional) => {
          const isSelected = bookingData.professionalId === professional.id;

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
                    <h4 className="font-semibold text-foreground mb-1">
                      {professional.name}
                    </h4>
                    {professional.email && (
                      <p className="text-sm text-muted-foreground">
                        {professional.email}
                      </p>
                    )}
                    {professional.phone && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {professional.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {professionals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum profissional disponível para este serviço</p>
        </div>
      )}
    </div>
  );
}
