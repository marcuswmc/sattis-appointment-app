"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {toast} from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface Service {
  _id: string
  name: string
}

interface CreateProfessionalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProfessionalDialog({ open, onOpenChange }: CreateProfessionalDialogProps) {
  const { data: session } = useSession()


  const [name, setName] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingServices, setIsLoadingServices] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      if (!session?.user.accessToken) return

      setIsLoadingServices(true)

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setServices(data)
        } else {
          toast.error( "Erro ao carregar serviços", {
            description: "Não foi possível carregar a lista de serviços",
          })
        }
      } catch (error) {
        console.error("Error fetching services:", error)
        toast.error("Erro ao carregar serviços", {
          description: "Ocorreu um erro ao carregar a lista de serviços",
        })
      } finally {
        setIsLoadingServices(false)
      }
    }

    if (open) {
      fetchServices()
    }
  }, [open, session, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user.accessToken) return

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/professional/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          name,
          services: selectedServices,
        }),
      })

      if (response.ok) {
        toast("Profissional criado", {
          description: "O profissional foi criado com sucesso",
        })

        setName("")
        setSelectedServices([])

        onOpenChange(false)

        window.location.reload()
      } else {
        const error = await response.json()
        toast("Erro ao criar profissional", {
          description: error.message || "Não foi possível criar o profissional",
        })
      }
    } catch (error) {
      console.error("Error creating professional:", error)
      toast("Erro ao criar profissional", {
        description: "Ocorreu um erro ao criar o profissional",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices((current) =>
      current.includes(serviceId) ? current.filter((id) => id !== serviceId) : [...current, serviceId],
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo profissional</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para criar um novo profissional</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Serviços</Label>
            {isLoadingServices ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="max-h-60 overflow-auto rounded-md border p-2">
                {services.length > 0 ? (
                  services.map((service) => (
                    <div key={service._id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`service-${service._id}`}
                        checked={selectedServices.includes(service._id)}
                        onCheckedChange={() => toggleService(service._id)}
                      />
                      <Label htmlFor={`service-${service._id}`} className="cursor-pointer text-sm font-normal">
                        {service.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-center text-sm text-muted-foreground">Nenhum serviço disponível</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || name.trim() === "" || selectedServices.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar profissional"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

