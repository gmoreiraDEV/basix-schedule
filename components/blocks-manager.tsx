"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Professional {
  id: string
  name: string
}

interface Block {
  id: string
  professionalId: string
  startTime: Date
  endTime: Date
  reason: string
}

export function BlocksManager() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<string>("")
  const [blocks, setBlocks] = useState<Block[]>([])
  const [newBlock, setNewBlock] = useState({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    reason: "",
  })

  useEffect(() => {
    fetch("/api/professionals")
      .then((res) => res.json())
      .then((data) => setProfessionals(data))
      .catch((err) => console.error("[v0] Error fetching professionals:", err))
  }, [])

  useEffect(() => {
    if (selectedProfessional) {
      fetch(`/api/blocks?professionalId=${selectedProfessional}`)
        .then((res) => res.json())
        .then((data) =>
          setBlocks(
            data.map((b: any) => ({
              ...b,
              startTime: new Date(b.startTime),
              endTime: new Date(b.endTime),
            })),
          ),
        )
        .catch((err) => console.error("[v0] Error fetching blocks:", err))
    }
  }, [selectedProfessional])

  const professionalBlocks = blocks.filter((b) => b.professionalId === selectedProfessional)

  const handleAddBlock = async () => {
    if (!selectedProfessional || !newBlock.date) return

    const startDateTime = new Date(`${newBlock.date}T${newBlock.startTime}`)
    const endDateTime = new Date(`${newBlock.date}T${newBlock.endTime}`)

    if (endDateTime <= startDateTime) {
      alert("O horário de término deve ser posterior ao horário de início")
      return
    }

    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: selectedProfessional,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          reason: newBlock.reason,
        }),
      })

      if (response.ok) {
        const savedBlock = await response.json()
        setBlocks([
          ...blocks,
          {
            ...savedBlock,
            startTime: new Date(savedBlock.startTime),
            endTime: new Date(savedBlock.endTime),
          },
        ])

        // Reset form
        setNewBlock({
          date: "",
          startTime: "09:00",
          endTime: "10:00",
          reason: "",
        })
      }
    } catch (error) {
      console.error("[v0] Error adding block:", error)
      alert("Erro ao adicionar bloqueio")
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBlocks(blocks.filter((b) => b.id !== blockId))
      }
    } catch (error) {
      console.error("[v0] Error deleting block:", error)
      alert("Erro ao deletar bloqueio")
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

  return (
    <div className="space-y-6">
      {/* Professional Selection */}
      <div className="space-y-2">
        <Label>Selecione o Profissional</Label>
        <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
          <SelectTrigger>
            <SelectValue placeholder="Escolha um profissional" />
          </SelectTrigger>
          <SelectContent>
            {professionals.map((prof) => (
              <SelectItem key={prof.id} value={prof.id}>
                {prof.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProfessional && (
        <>
          {/* Add New Block */}
          <Card className="p-4 bg-muted/50">
            <h4 className="font-medium text-foreground mb-4">Adicionar Bloqueio</h4>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={newBlock.date}
                    onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário Início</Label>
                  <Input
                    type="time"
                    value={newBlock.startTime}
                    onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário Fim</Label>
                  <Input
                    type="time"
                    value={newBlock.endTime}
                    onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Motivo</Label>
                <Textarea
                  value={newBlock.reason}
                  onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                  placeholder="Ex: Reunião, Almoço, Compromisso pessoal..."
                  rows={2}
                />
              </div>

              <Button onClick={handleAddBlock} disabled={!newBlock.date}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Bloqueio
              </Button>
            </div>
          </Card>

          {/* Existing Blocks */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Bloqueios Configurados</h4>
            {professionalBlocks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum bloqueio configurado para este profissional
              </p>
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Início</TableHead>
                      <TableHead>Término</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professionalBlocks
                      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                      .map((block) => (
                        <TableRow key={block.id}>
                          <TableCell>{formatDateTime(block.startTime)}</TableCell>
                          <TableCell>{formatDateTime(block.endTime)}</TableCell>
                          <TableCell className="text-muted-foreground">{block.reason || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteBlock(block.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
