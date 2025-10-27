"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
]

interface Professional {
  id: string
  name: string
}

interface ScheduleRule {
  professionalId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  active: boolean
}

export function ScheduleRulesManager() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<string>("")
  const [rules, setRules] = useState<ScheduleRule[]>([])
  const [newRule, setNewRule] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
    active: true,
  })

  useEffect(() => {
    fetch("/api/professionals")
      .then((res) => res.json())
      .then((data) => setProfessionals(data))
      .catch((err) => console.error("[v0] Error fetching professionals:", err))
  }, [])

  useEffect(() => {
    if (selectedProfessional) {
      fetch(`/api/schedule-rules?professionalId=${selectedProfessional}`)
        .then((res) => res.json())
        .then((data) => setRules(data))
        .catch((err) => console.error("[v0] Error fetching schedule rules:", err))
    }
  }, [selectedProfessional])

  const professionalRules = rules.filter((r) => r.professionalId === selectedProfessional)

  const handleAddRule = async () => {
    if (!selectedProfessional) return

    const ruleExists = rules.some((r) => r.professionalId === selectedProfessional && r.dayOfWeek === newRule.dayOfWeek)

    if (ruleExists) {
      alert("Já existe uma regra para este dia da semana")
      return
    }

    try {
      const response = await fetch("/api/schedule-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: selectedProfessional,
          ...newRule,
        }),
      })

      if (response.ok) {
        const savedRule = await response.json()
        setRules([...rules, savedRule])
      }
    } catch (error) {
      console.error("[v0] Error adding schedule rule:", error)
      alert("Erro ao adicionar horário")
    }
  }

  const handleDeleteRule = async (professionalId: string, dayOfWeek: number) => {
    try {
      const response = await fetch(`/api/schedule-rules?professionalId=${professionalId}&dayOfWeek=${dayOfWeek}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRules(rules.filter((r) => !(r.professionalId === professionalId && r.dayOfWeek === dayOfWeek)))
      }
    } catch (error) {
      console.error("[v0] Error deleting schedule rule:", error)
      alert("Erro ao deletar horário")
    }
  }

  const handleToggleRule = async (professionalId: string, dayOfWeek: number) => {
    const rule = rules.find((r) => r.professionalId === professionalId && r.dayOfWeek === dayOfWeek)
    if (!rule) return

    try {
      const response = await fetch("/api/schedule-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          dayOfWeek,
          active: !rule.active,
        }),
      })

      if (response.ok) {
        setRules(
          rules.map((r) =>
            r.professionalId === professionalId && r.dayOfWeek === dayOfWeek ? { ...r, active: !r.active } : r,
          ),
        )
      }
    } catch (error) {
      console.error("[v0] Error toggling schedule rule:", error)
      alert("Erro ao atualizar horário")
    }
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
          {/* Add New Rule */}
          <Card className="p-4 bg-muted/50">
            <h4 className="font-medium text-foreground mb-4">Adicionar Horário</h4>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Select
                  value={newRule.dayOfWeek.toString()}
                  onValueChange={(value) => setNewRule({ ...newRule, dayOfWeek: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Horário Início</Label>
                <Input
                  type="time"
                  value={newRule.startTime}
                  onChange={(e) => setNewRule({ ...newRule, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Horário Fim</Label>
                <Input
                  type="time"
                  value={newRule.endTime}
                  onChange={(e) => setNewRule({ ...newRule, endTime: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddRule} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>

          {/* Existing Rules */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Horários Configurados</h4>
            {professionalRules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum horário configurado para este profissional
              </p>
            ) : (
              <div className="space-y-2">
                {DAYS_OF_WEEK.map((day) => {
                  const rule = professionalRules.find((r) => r.dayOfWeek === day.value)
                  if (!rule) return null

                  return (
                    <Card key={day.value} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-32">
                            <span className="font-medium text-foreground">{day.label}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              {rule.startTime} - {rule.endTime}
                            </span>
                          </div>
                          <Badge variant={rule.active ? "default" : "secondary"}>
                            {rule.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.active}
                            onCheckedChange={() => handleToggleRule(selectedProfessional, day.value)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRule(selectedProfessional, day.value)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
