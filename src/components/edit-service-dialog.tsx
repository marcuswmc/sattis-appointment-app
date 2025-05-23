"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppointments } from "@/hooks/appointments-context"
import { Service } from "@/hooks/appointments-context"

interface EditServiceDialogProps {
  service: Service
  token: string | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditServiceDialog({ 
  service, 
  token, 
  open, 
  onOpenChange,
  onSuccess 
}: EditServiceDialogProps) {
  const { categories } = useAppointments()

  const [name, setName] = useState(service.name)
  const [description, setDescription] = useState(service.description)
  const [price, setPrice] = useState(service.price.toString())
  const [duration, setDuration] = useState(service.duration.toString())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    typeof service.category === 'string' 
      ? service.category 
      : service.category._id
  )
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(service.name)
      setDescription(service.description)
      setPrice(service.price.toString())
      setDuration(service.duration.toString())
      setSelectedCategory(
        typeof service.category === 'string' 
          ? service.category 
          : service.category._id
      )
    }
  }, [open, service])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !selectedCategory) return

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
          category: selectedCategory
        }),
      })

      if (response.ok) {
        toast("Serviço atualizado", {
          description: "O serviço foi atualizado com sucesso",
        })

        onOpenChange(false)
        onSuccess?.()
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
          <DialogDescription>Atualize as informações do serviço</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (€)</Label>
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
            <Label>Categorias</Label>
            <div className="max-h-60 overflow-auto rounded-md border p-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category._id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`category-${category._id}`}
                      checked={selectedCategory === category._id}
                      onCheckedChange={() => 
                        setSelectedCategory(prev => 
                          prev === category._id ? null : category._id
                        )
                      }
                    />
                    <Label 
                      htmlFor={`category-${category._id}`} 
                      className="cursor-pointer text-sm font-normal"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  Nenhuma categoria disponível
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="outline" 
              disabled={isLoading || !selectedCategory}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Atualizar serviço"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}