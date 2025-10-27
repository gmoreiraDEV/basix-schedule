"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, XCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface Booking {
  id: string
  clientName: string
  clientEmail: string | null
  clientPhone: string | null
  startTime: Date
  endTime: Date
  status: string
  notes: string | null
  service: {
    id: string
    name: string
    price: number
  }
  professional: {
    id: string
    name: string
  }
}

export function BookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) =>
        setBookings(
          data.map((b: any) => ({
            ...b,
            startTime: new Date(b.startTime),
            endTime: new Date(b.endTime),
          })),
        ),
      )
      .catch((err) => console.error("[v0] Error fetching bookings:", err))
  }, [])

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      })

      if (response.ok) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)))
      }
    } catch (error) {
      console.error("[v0] Error cancelling booking:", error)
      alert("Erro ao cancelar agendamento")
    }
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum agendamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">{booking.service.name}</TableCell>
                  <TableCell className="text-muted-foreground">{booking.professional.name}</TableCell>
                  <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                  <TableCell>
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                      {booking.status === "confirmed" ? "Confirmado" : "Cancelado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes do Agendamento</DialogTitle>
                            <DialogDescription>Informações completas do agendamento</DialogDescription>
                          </DialogHeader>
                          {selectedBooking && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h4>
                                <p className="text-foreground">{selectedBooking.clientName}</p>
                                {selectedBooking.clientEmail && (
                                  <p className="text-sm text-muted-foreground">{selectedBooking.clientEmail}</p>
                                )}
                                {selectedBooking.clientPhone && (
                                  <p className="text-sm text-muted-foreground">{selectedBooking.clientPhone}</p>
                                )}
                              </div>
                              <Separator />
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Serviço</h4>
                                  <p className="text-foreground">{selectedBooking.service.name}</p>
                                  <p className="text-sm text-accent font-medium">
                                    {formatPrice(selectedBooking.service.price)}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Profissional</h4>
                                  <p className="text-foreground">{selectedBooking.professional.name}</p>
                                </div>
                              </div>
                              <Separator />
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Início</h4>
                                  <p className="text-foreground">{formatDateTime(selectedBooking.startTime)}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Término</h4>
                                  <p className="text-foreground">{formatDateTime(selectedBooking.endTime)}</p>
                                </div>
                              </div>
                              {selectedBooking.notes && (
                                <>
                                  <Separator />
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Observações</h4>
                                    <p className="text-foreground">{selectedBooking.notes}</p>
                                  </div>
                                </>
                              )}
                              <Separator />
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                                <Badge variant={selectedBooking.status === "confirmed" ? "default" : "secondary"}>
                                  {selectedBooking.status === "confirmed" ? "Confirmado" : "Cancelado"}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      {booking.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
