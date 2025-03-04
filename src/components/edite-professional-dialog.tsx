"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Professional {
  _id: string
  name: string
  services: Service[] // Adicione essa propriedade
}

interface Service {
  _id: string
  name: string
}

interface EditProfessionalDialogProps {
  professional: Professional
  services: Service[] // Corrigir para aceitar o array de serviços completo
  token: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}


export function EditProfessionalDialog({
  professional,
  services,
  token,
  open,
  onOpenChange,
  onSuccess,
}: EditProfessionalDialogProps) {
  const [name, setName] = useState(professional.name);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    professional.services.map((service) => service._id)
  );
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (professional) {
      setName(professional.name);
      setSelectedServices(professional.services.map((service) => service._id));
    }
  }, [professional]);
  

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/professional/${professional._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          services: selectedServices,
        }),
      });

      if (response.ok) {
        toast("Profissional atualizado", {
          description: "O profissional foi atualizado com sucesso.",
        });

        onSuccess();
      } else {
        const error = await response.json();
        toast.error("Erro ao atualizar profissional", {
          description: error.message || "Não foi possível atualizar o profissional.",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar profissional:", error);
      toast.error("Erro ao atualizar profissional", {
        description: "Ocorreu um erro ao atualizar o profissional.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Profissional</DialogTitle>
          <DialogDescription>Atualize os dados do profissional abaixo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Serviços</Label>
            <div className="grid grid-cols-2 gap-2">
              {services.map((service) => (
                <div key={service._id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedServices.includes(service._id)}
                    onCheckedChange={() => handleServiceToggle(service._id)}
                  />
                  <span>{service.name}</span>
                </div>
              ))}
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
  );
}
