"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreateServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateServiceDialog({ open, onOpenChange }: CreateServiceDialogProps) {
  const { data: session } = useSession()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("")
  const [availableTimes, setAvailableTimes] = useState<string[]>(["08:00", "09:00", "10:00"])
  const [newTime, setNewTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddTime = () => {
    if (newTime && !availableTimes.includes(newTime)) {
      setAvailableTimes([...availableTimes, newTime])
      setNewTime("")
    }
  }

  const handleRemoveTime = (time: string) => {
    setAvailableTimes(availableTimes.filter((t) => t !== time))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user.accessToken) return

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: Number.parseFloat(price),
          duration: Number.parseInt(duration),
          availableTimes,
        }),
      })

      if (response.ok) {
        toast("Serviço criado",{
          description: "O serviço foi criado com sucesso",
        })


        setName("")
        setDescription("")
        setPrice("")
        setDuration("")
        setAvailableTimes(["08:00", "09:00", "10:00"])
        setNewTime("")


        onOpenChange(false)


        window.location.reload()
      } else {
        const error = await response.json()
        toast("Erro ao criar serviço", {
          description: error.message || "Não foi possível criar o serviço",
        })
      }
    } catch (error) {
      console.error("Error creating service:", error)
      toast("Erro ao criar serviço", {
        description: "Ocorreu um erro ao criar o serviço",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo serviço</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para criar um novo serviço</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Horários disponíveis</Label>
            <div className="flex items-center gap-2">
              <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              <Button type="button" variant="outline" size="icon" onClick={handleAddTime}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {availableTimes.map((time) => (
                <div key={time} className="flex items-center rounded-md border bg-secondary px-2 py-1 text-sm">
                  {time}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-4 w-4"
                    onClick={() => handleRemoveTime(time)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar serviço"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

