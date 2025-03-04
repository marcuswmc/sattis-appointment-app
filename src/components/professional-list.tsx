"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Edit, Trash } from "lucide-react"
import { toast } from "sonner"
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
} from "@/components/ui/alert-dialog"

import { EditProfessionalDialog } from "./edite-professional-dialog"
import { Service, Professional, useAppointments } from "@/hooks/appointments-context"



interface ProfessionalListProps {
  token: string | undefined
}

export function ProfessionalList({ token }: ProfessionalListProps) {
  const {professionals, services, isLoading, fetchServicesAndProfessionals, fetchAppointments} = useAppointments()
  const [professionalToEdit, setProfessionalToEdit] = useState<Professional | null>(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    if(token){
      fetchServicesAndProfessionals(token)
      fetchAppointments(token)
    }
  }, [fetchAppointments, fetchServicesAndProfessionals])
  const handleDeleteProfessional = async (id: string) => {
    if (!token) return;

    setIsDeleteLoading(id);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/professional/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast("Profissional excluído", {
          description: "O profissional foi excluído com sucesso",
        });

        // Atualiza a lista de profissionais no contexto
        fetchServicesAndProfessionals(token);
      } else {
        toast.error("Erro ao excluir profissional", {
          description: "Não foi possível excluir o profissional",
        });
      }
    } catch (error) {
      console.error("Error deleting professional:", error);
      toast.error("Erro ao excluir profissional", {
        description: "Ocorreu um erro ao excluir o profissional",
      });
    } finally {
      setIsDeleteLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (professionals.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-lg font-medium">Nenhum profissional encontrado</h3>
        <p className="text-muted-foreground">Clique no botão "Novo profissional" para adicionar um profissional</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {professionals.map((professional) => (
          <Card key={professional._id} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{professional.name}</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setProfessionalToEdit(professional)}>
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
                        <AlertDialogTitle>Excluir profissional</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProfessional(professional._id)}
                          disabled={isDeleteLoading === professional._id}
                        >
                          {isDeleteLoading === professional._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium">Serviços:</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {professional.services.length > 0 ? (
                    professional.services.map((service) => (
                      <Badge key={service._id} variant="secondary">
                        {service.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Nenhum serviço atribuído</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {professionalToEdit && (
        <EditProfessionalDialog
          professional={professionalToEdit}
          services={services}
          token={token ?? ""}
          open={!!professionalToEdit}
          onOpenChange={(open) => {
            if (!open) setProfessionalToEdit(null);
          }}
          onSuccess={() => {
            setProfessionalToEdit(null);
            fetchServicesAndProfessionals(token);
          }}
        />
      )}
    </>
  );
}