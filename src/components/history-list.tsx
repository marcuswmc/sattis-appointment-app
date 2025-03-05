"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAppointments } from "@/hooks/appointments-context";


interface HistoryPageProps {
  token: string | undefined
}

export default function HistoryList({token }: HistoryPageProps) {
  const searchParams = useSearchParams();
  const { appointments, isLoading, fetchAppointments } = useAppointments();

  useEffect(() => {
    if(token){

      fetchAppointments(token, ["FINISHED", "CANCELED"]);
    }
  }, [token, fetchAppointments, searchParams]);

  const filterDate = searchParams.get("date");
  const filterService = searchParams.get("service");
  const filterProfessional = searchParams.get("professional");

  let filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "FINISHED" ||
      appointment.status === "CANCELED"
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

  const sortedAppointments = [...filteredAppointments].reverse();

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
              <TableHead className="w-1/6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAppointments.length > 0 ? (
              sortedAppointments.map((appointment) => (
                <TableRow key={appointment._id} className="hover:bg-gray-100 transition-colors">
                  <TableCell className="truncate max-w-xs" title={appointment.serviceId.name}>
                    {appointment.serviceId.name}
                  </TableCell>
                  <TableCell className="truncate max-w-xs" title={appointment.professionalId.name}>
                    {appointment.professionalId.name}
                  </TableCell>
                  <TableCell className="truncate max-w-xs" title={appointment.customerName}>
                    {appointment.customerName}
                  </TableCell>
                  <TableCell className="truncate">
                    {appointment.customerPhone}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(appointment.date)}
                  </TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum agendamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Versão para telas menores */}
      <div className="md:hidden space-y-4">
        {sortedAppointments.length > 0 ? (
          sortedAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Serviço</p>
                  <p className="font-medium">{appointment.serviceId.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Profissional</p>
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
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{appointment.status}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum agendamento encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
