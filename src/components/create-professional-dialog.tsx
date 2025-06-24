"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { ScrollArea } from "./ui/scroll-area";

interface Service {
  _id: string;
  name: string;
}

interface CreateProfessionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProfessionalDialog({
  open,
  onOpenChange,
}: CreateProfessionalDialogProps) {
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      if (!session?.user.accessToken) return;

      setIsLoadingServices(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/services`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setServices(data);
        } else {
          toast.error("Erro ao carregar serviços", {
            description: "Não foi possível carregar a lista de serviços",
          });
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Erro ao carregar serviços", {
          description: "Ocorreu um erro ao carregar a lista de serviços",
        });
      } finally {
        setIsLoadingServices(false);
      }
    };

    if (open) {
      fetchServices();
    }
  }, [open, session, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user.accessToken) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      selectedServices.forEach((id) => formData.append("services", id));
      if (image) formData.append("image", image);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/professional/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        toast("Profissional criado", {
          description: "O profissional foi criado com sucesso",
        });

        setName("");
        setSelectedServices([]);
        setImage(null);

        onOpenChange(false);
        window.location.reload();
      } else {
        const error = await response.json();
        toast("Erro ao criar profissional", {
          description: error.message || "Não foi possível criar o profissional",
        });
      }
    } catch (error) {
      console.error("Error creating professional:", error);
      toast("Erro ao criar profissional", {
        description: "Ocorreu um erro ao criar o profissional",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md sm:h-[90vh] md:h-auto">
        <DialogHeader>
          <DialogTitle>Novo profissional</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar um novo profissional
          </DialogDescription>
        </DialogHeader>
          <ScrollArea className="h-[480px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <Label htmlFor="image">Imagem</Label>

              <div className="relative h-20 w-20">
                <Label
                  htmlFor="image"
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
                      <ImagePlus className="h-4 w-4 mb-1" />
                      <span className="text-xs text-center">Selecionar imagem</span>
                    </div>
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImage(file);
                      setImagePreview(file ? URL.createObjectURL(file) : null);
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
                Adicione a imagem que será exibida ao cliente no momento da marcação.
              </p>
            </div>
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
                    <div
                      key={service._id}
                      className="flex items-center space-x-2 py-1"
                    >
                      <Checkbox
                        id={`service-${service._id}`}
                        checked={selectedServices.includes(service._id)}
                        onCheckedChange={() => toggleService(service._id)}
                      />
                      <Label
                        htmlFor={`service-${service._id}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {service.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-center text-sm text-muted-foreground">
                    Nenhum serviço disponível
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || name.trim() === "" || selectedServices.length === 0
              }
            >
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
