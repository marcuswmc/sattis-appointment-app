"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

interface Service {
  _id: string
  name: string
  description: string
  price: number
  duration: number
  availableTimes: string[]
}

interface EditServiceDialogProps {
  service: Service
  token: string | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditServiceDialog({ service, token, open, onOpenChange, onSuccess }: EditServiceDialogProps) {

  const [name, setName] = useState(service.name)
  const [description, setDescription] = useState(service.description)
  const [price, setPrice] = useState(service.price.toString())
  const [duration, setDuration] = useState(service.duration.toString())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (service) {
      setName(service.name)
      setDescription(service.description)
      setPrice(service.price.toString())
      setDuration(service.duration.toString())
    }
  }, [service])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) return

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service/${service._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: Number.parseFloat(price),
          duration: Number.parseInt(duration),
        }),
      })

      if (response.ok) {
        toast("Serviço atualizado", {
          description: "O serviço foi atualizado com sucesso",
        })

        onSuccess()
      } else {
        const error = await response.json()
        toast.error("Erro ao atualizar serviço", {
          description: error.message || "Não foi possível atualizar o serviço",
        })
      }
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error("Erro ao atualizar serviço", {
        description: "Ocorreu um erro ao atualizar o serviço",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar serviço</DialogTitle>
          <DialogDescription>Edite os campos abaixo para atualizar o serviço</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço (R$)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duração (minutos)</Label>
              <Input
                id="edit-duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} variant="outline">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

