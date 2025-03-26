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
import { Loader2, Plus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppointments } from "@/hooks/appointments-context"

interface CreateServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateServiceDialog({ open, onOpenChange }: CreateServiceDialogProps) {
  const { data: session } = useSession()
  const { categories, fetchCategories } = useAppointments()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)

  useEffect(() => {
    if (open) {

      setIsCategoriesLoading(true)
      fetchCategories(session?.user.accessToken)
        .finally(() => setIsCategoriesLoading(false))
    }
  }, [open, session?.user.accessToken, fetchCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user.accessToken || !selectedCategory) return

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
          category: selectedCategory
        }),
      })

      if (response.ok) {
        toast("Serviço criado", {
          description: "O serviço foi criado com sucesso",
        })

        setName("")
        setDescription("")
        setPrice("")
        setDuration("")
        setSelectedCategory(null)

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
            {isCategoriesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
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
            )}
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