"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Check, X, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useAppointments } from "@/hooks/appointments-context";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppointmentListProps {
  token: string | undefined;
}

export function AppointmentList({ token }: AppointmentListProps) {
  const searchParams = useSearchParams();
  const { appointments, isLoading, fetchAppointments, setAppointments } =
    useAppointments();

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments(token);
  }, [token, fetchAppointments, searchParams]);

  const filterDate = searchParams.get("date");
  const filterService = searchParams.get("service");
  const filterProfessional = searchParams.get("professional");

  let filteredAppointments = appointments.filter(
    (appointment) => appointment.status === "CONFIRMED"
  ).reverse();

  if (filterDate) {
    filteredAppointments = filteredAppointments.filter(
      (appointment) => appointment.date === filterDate
    );
  }

  if (filterService) {
    filteredAppointments = filteredAppointments.filter(
      (appointment) => appointment.serviceId._id === filterService
    );
  }

  if (filterProfessional) {
    filteredAppointments = filteredAppointments.filter(
      (appointment) => appointment.professionalId._id === filterProfessional
    );
  }

  const updateAppointmentStatus = async (id: string, status: string) => {
    if (!token) return;

    try {
      console.log("Atualizando status do agendamento ID:", id);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointment/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        setAppointments((prev) =>
          prev.filter((appointment) => appointment._id !== id)
        );
        toast("Status atualizado", {
          description: `Agendamento ${
            status === "FINISHED" ? "finalizado" : "cancelado"
          } com sucesso`,
        });
      } else {
        toast.error("Erro ao atualizar", {
          description: "Não foi possível atualizar o status",
        });
      }
    } catch (error) {
      toast.error("Erro ao atualizar", {
        description: "Não foi possível atualizar o status",
      });
    }
  };

  const handleCancelClick = (id: string) => {
    setSelectedAppointmentId(id);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedAppointmentId) {
      await updateAppointmentStatus(selectedAppointmentId, "CANCELED");
      setIsModalOpen(false);
      setSelectedAppointmentId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Versão para telas maiores */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/6">Serviço</TableHead>
              <TableHead className="w-1/6">Profissional</TableHead>
              <TableHead className="w-1/6">Data</TableHead>
              <TableHead className="w-1/6">Hora</TableHead>
              <TableHead className="w-1/6">Cliente</TableHead>
              <TableHead className="w-1/6">Tel</TableHead>
              <TableHead className="w-1/6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow
                  key={appointment._id}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <TableCell
                    className="truncate max-w-xs"
                    title={appointment.serviceId.name}
                  >
                    <div className="p-2 bg-accent rounded-md inline">
                      {appointment.serviceId.name}
                    </div>
                  </TableCell>
                  <TableCell
                    className="whitespace-nowrap max-w-xs"
                    title={appointment.professionalId.name}
                  >
                    <div className="p-2 bg-accent rounded-md inline">
                      {appointment.professionalId.name}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="p-2 bg-accent rounded-md inline">
                      {formatDate(appointment.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="p-2 bg-accent rounded-md inline">
                      {appointment.time}
                    </div>
                  </TableCell>
                  <TableCell
                    className="truncate"
                    title={appointment.customerName}
                  >
                    {appointment.customerName}
                  </TableCell>
                  <TableCell className="truncate">
                    {appointment.customerPhone}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() =>
                          updateAppointmentStatus(appointment._id, "FINISHED")
                        }
                      >
                        <Check className="h-4 w-4" />
                        Finalizar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleCancelClick(appointment._id)}
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  Nenhum agendamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <Card key={appointment._id} className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {appointment.serviceId.name}
                  <div className="flex gap-2 mt-2">
                    <p className="text-sm font-medium text-gray-500">
                      Profissional:
                    </p>
                    <p className="text-sm">{appointment.professionalId.name}</p>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="flex gap-2">
                      <p className="text-sm font-medium text-gray-500">Data</p>
                      <p className="text-sm">{formatDate(appointment.date)}</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="text-sm font-medium text-gray-500">Hora</p>
                      <p className="text-sm">{appointment.time}</p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 mb-3">
                  
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Cliente
                      </p>
                      <p>{appointment.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Telefone
                      </p>
                      <p>{appointment.customerPhone}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleCancelClick(appointment._id)}
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-gray-950 text-gray-50"
                    onClick={() =>
                      updateAppointmentStatus(appointment._id, "FINISHED")
                    }
                  >
                    <Check className="h-4 w-4" />
                    Finalizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum agendamento encontrado.
          </div>
        )}

        {/* Modal de confirmação para cancelar */}
        <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja cancelar este agendamento?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer"
              >
                Manter agendamento
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmCancel}
                className="cursor-pointer"
              >
                Sim, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
