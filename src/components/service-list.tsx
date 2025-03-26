"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Edit, Trash, Tag } from "lucide-react";
import { toast } from "sonner";
import { EditServiceDialog } from "@/components/edit-service-dialog";
import { useAppointments } from "@/hooks/appointments-context";
import { Service, Category } from "@/hooks/appointments-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ServiceListProps {
  token: string | undefined;
}

export function ServiceList({ token }: ServiceListProps) {
  const {
    categories,
    fetchCategories,
    services,
    isLoading,
    fetchServicesAndProfessionals,
    fetchAppointments,
  } = useAppointments();
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchServicesAndProfessionals(token);
    fetchCategories(token);
    fetchAppointments(token);
  }, [token]);

  const handleDeleteService = async (id: string) => {
    if (!token) return;

    setIsDeleteLoading(id);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/service/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        // Recarregar serviços após deleção
        fetchServicesAndProfessionals(token);
        toast("Serviço excluído", {
          description: "O serviço foi excluído com sucesso",
        });
      } else {
        toast.error("Erro ao excluir serviço", {
          description: "Não foi possível excluir o serviço",
        });
      }
    } catch (error) {
      toast.error("Erro ao excluir serviço", {
        description: "Ocorreu um erro ao excluir o serviço",
      });
    } finally {
      setIsDeleteLoading(null);
    }
  };

  const findCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "Sem categoria";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-lg font-medium">Nenhum serviço encontrado</h3>
        <p className="text-muted-foreground">
          Clique no botão "+ Add" para adicionar um serviço
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {services.map((service) => (
          <Card key={service._id} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{service.name}</h3>
                  {service.category && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      {typeof service.category === "string"
                        ? findCategoryName(service.category)
                        : service.category.name}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setServiceToEdit(service)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir serviço</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este serviço? Esta ação
                          não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteService(service._id)}
                          disabled={isDeleteLoading === service._id}
                        >
                          {isDeleteLoading === service._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm truncate">
                <div>
                  <span className="font-medium">Preço:</span>{" "}
                  {formatCurrency(service.price)}
                </div>
                <div>
                  <span className="font-medium">Duração:</span>{" "}
                  {service.duration} minutos
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {serviceToEdit && (
        <EditServiceDialog
          service={serviceToEdit}
          token={token}
          open={!!serviceToEdit}
          onOpenChange={(open) => {
            if (!open) setServiceToEdit(null);
          }}
          onSuccess={() => {
            setServiceToEdit(null);
            fetchServicesAndProfessionals(token);
          }}
        />
      )}
    </>
  );
}
