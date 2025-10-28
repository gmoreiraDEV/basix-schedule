"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Professional {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  services: Array<{
    id: string;
    name: string;
  }>;
}

export function ProfessionalsTable() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    fetch("/api/professionals")
      .then((res) => res.json())
      .then((data) => setProfessionals(data))
      .catch((err) => console.error("[v0] Error fetching professionals:", err));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este profissional?")) return;

    try {
      const response = await fetch(`/api/professionals/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProfessionals(professionals.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("[v0] Error deleting professional:", error);
      alert("Erro ao deletar profissional");
    }
  };

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
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                Nenhum profissional cadastrado
              </TableCell>
            </TableRow>
          ) : (
            professionals.map((professional) => (
              <TableRow key={professional.id}>
                <TableCell className="font-medium">
                  {professional.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {professional.email || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {professional.phone || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {professional.services.length === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        Nenhum
                      </span>
                    ) : (
                      professional.services.map((service) => (
                        <Badge
                          key={service.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {service.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={professional.active ? "default" : "secondary"}
                  >
                    {professional.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/dashboard/professionals/${professional.id}/edit`}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(professional.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
