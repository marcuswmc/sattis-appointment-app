"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner"
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
  );

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
        `${
            process.env.NEXT_PUBLIC_API_URL
          }/appointment/${id}`,
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
              <TableHead className="w-1/6">Cliente</TableHead>
              <TableHead className="w-1/12">Tel</TableHead>
              <TableHead className="w-1/12">Data</TableHead>
              <TableHead className="w-1/12">Hora</TableHead>
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
                    {appointment.serviceId.name}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-xs"
                    title={appointment.professionalId.name}
                  >
                    {appointment.professionalId.name}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-xs"
                    title={appointment.customerName}
                  >
                    {appointment.customerName}
                  </TableCell>
                  <TableCell className="truncate">
                    {appointment.customerPhone}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(appointment.date)}
                  </TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
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

      {/* Versão para telas menores (layout em cards) */}
      <div className="md:hidden space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-lg shadow p-4 border border-gray-200"
            >
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Serviço</p>
                  <p className="font-medium">{appointment.serviceId.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Profissional
                  </p>
                  <p>{appointment.professionalId.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cliente</p>
                  <p>{appointment.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p>{appointment.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data</p>
                  <p>{formatDate(appointment.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Hora</p>
                  <p>{appointment.time}</p>
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
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum agendamento encontrado.
          </div>
        )}
      </div>

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
            <AlertDialogCancel onClick={() => setIsModalOpen(false)} className="cursor-pointer">
              Manter agendamento
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="cursor-pointer">
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
