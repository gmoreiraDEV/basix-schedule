"use client"

import { useState } from "react"
import { mockProfessionals, mockServiceProfessionals, mockServices } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ProfessionalsTable() {
  const [professionals] = useState(mockProfessionals)

  const getProfessionalServices = (professionalId: string) => {
    const serviceIds = mockServiceProfessionals
      .filter((sp) => sp.professionalId === professionalId)
      .map((sp) => sp.serviceId)

    return mockServices.filter((s) => serviceIds.includes(s.id))
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Serviços</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {professionals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Nenhum profissional cadastrado
              </TableCell>
            </TableRow>
          ) : (
            professionals.map((professional) => {
              const services = getProfessionalServices(professional.id)
              return (
                <TableRow key={professional.id}>
                  <TableCell className="font-medium">{professional.name}</TableCell>
                  <TableCell className="text-muted-foreground">{professional.email || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{professional.phone || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {services.length === 0 ? (
                        <span className="text-sm text-muted-foreground">Nenhum</span>
                      ) : (
                        services.map((service) => (
                          <Badge key={service.id} variant="outline" className="text-xs">
                            {service.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={professional.active ? "default" : "secondary"}>
                      {professional.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/professionals/${professional.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
