"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ImagePlus, X } from "lucide-react";
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
  _id: string;
  name: string;
  services: Service[];
  image?: string;
}

interface Service {
  _id: string;
  name: string;
}

interface EditProfessionalDialogProps {
  professional: Professional;
  services: Service[];
  token: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
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

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    professional.image || null
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (professional) {
      setName(professional.name);
      setSelectedServices(professional.services.map((service) => service._id));
      setImage(null);

      const img = (professional as any).image || null;
      setImagePreview(img);
    }
  }, [professional]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      selectedServices.forEach((id) => formData.append("services", id));
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/professional/${professional._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        toast("Profissional atualizado", {
          description: "O profissional foi atualizado com sucesso.",
        });
        onSuccess();
      } else {
        const error = await response.json();
        toast.error("Erro ao atualizar profissional", {
          description:
            error.message || "Não foi possível atualizar o profissional.",
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
          <DialogDescription>
            Atualize os dados do profissional abaixo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Imagem */}
          <div className="flex items-center gap-8">
            <div className="space-y-2">
              <Label htmlFor="edit-image">Imagem</Label>

              <div className="relative h-32 w-32">
                <Label
                  htmlFor="edit-image"
                  className={`group flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border transition hover:border-primary ${
                    imagePreview ? "border-muted" : "border-muted-foreground"
                  }`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImagePlus className="h-6 w-6 mb-1" />
                      <span className="text-xs">Selecionar imagem</span>
                    </div>
                  )}
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImage(file);
                      setImagePreview(
                        file
                          ? URL.createObjectURL(file)
                          : professional.image || null
                      );
                    }}
                  />
                </Label>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 rounded-full bg-background p-1 shadow hover:bg-muted"
                    aria-label="Remover imagem"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">
                Imagem que será exibida ao cliente no momento da
                marcação.
              </p>
            </div>
          </div>

          {/* Serviços */}
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
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
