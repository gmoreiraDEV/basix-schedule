"use client";

import type { BookingData } from "@/components/booking-wizard";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import type { TimeSlot } from "@/lib/availability";

interface StepDateTimeProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
}

export function StepDateTime({
  bookingData,
  updateBookingData,
}: StepDateTimeProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    bookingData.date || undefined
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate && bookingData.professionalId && bookingData.serviceId) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        professionalId: bookingData.professionalId,
        serviceId: bookingData.serviceId,
        date: selectedDate.toISOString(),
      });

      const response = await fetch(`/api/availability?${params}`);
      const data = await response.json();

      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error("[v0] Error fetching slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    updateBookingData({ date: date || null, time: "" });
  };

  const handleTimeSelect = (time: string) => {
    updateBookingData({ time });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Selecione Data e Horário
        </h3>
        <p className="text-sm text-muted-foreground">
          Profissional: <strong>{bookingData.professionalName}</strong>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card className="p-4">
          <h4 className="font-medium text-foreground mb-4">Escolha a Data</h4>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date()}
            className="rounded-md border border-border"
          />
        </Card>

        {/* Time Slots */}
        <Card className="p-4">
          <h4 className="font-medium text-foreground mb-4">
            Escolha o Horário
          </h4>

          {!selectedDate ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Selecione uma data primeiro
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Nenhum horário disponível
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {availableSlots.map((slot) => {
                const isSelected = bookingData.time === slot.time;
                const isAvailable = slot.available;
                console.log(isAvailable);
                return (
                  <Button
                    key={slot.time}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={!isAvailable}
                    onClick={() => handleTimeSelect(slot.time)}
                    className="relative text-white"
                  >
                    {isSelected && <Check className="h-3 w-3 mr-1" />}
                    {slot.time}
                  </Button>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
