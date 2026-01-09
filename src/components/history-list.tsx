"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
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
import {
  Loader2,
  MoreHorizontal,
  Calendar,
  Clock,
  Phone,
  User,
  Flag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useAppointments, type Appointment } from "@/hooks/appointments-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HistoryListProps {
  token: string | undefined;
}

export default function HistoryList({ token }: HistoryListProps) {
  const searchParams = useSearchParams();
  const {
    appointments,
    isLoading,
    fetchAppointments,
    setAppointments,
    customerMissedStatus,
    updateCustomerMissedStatus,
  } = useAppointments();

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "date",
      desc: true,
    },
  ]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  useEffect(() => {
    const historyStatuses = ["FINISHED", "CANCELED"];
    const missedFilter = searchParams.get("missed");

    if (missedFilter === "true") {
      fetchAppointments(token, ["CONFIRMED", "FINISHED", "CANCELED"]);
    } else {
      fetchAppointments(token, historyStatuses);
    }
  }, [token, fetchAppointments, searchParams]);

  const filterDate = searchParams.get("date");
  const filterService = searchParams.get("service");
  const filterProfessional = searchParams.get("professional");
  const filterMissed = searchParams.get("missed");

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(
      (appointment) =>
        appointment.status === "FINISHED" || appointment.status === "CANCELED"
    );

    if (filterDate) {
      filtered = filtered.filter(
        (appointment) => appointment.date === filterDate
      );
    }

    if (filterService) {
      filtered = filtered.filter(
        (appointment) => appointment.serviceId._id === filterService
      );
    }

    if (filterProfessional) {
      filtered = filtered.filter(
        (appointment) => appointment.professionalId._id === filterProfessional
      );
    }

    if (filterMissed === "true") {
      filtered = filtered.filter(
        (appointment) =>
          customerMissedStatus[appointment.customerEmail] === true
      );
    } else if (filterMissed === "false") {
      filtered = filtered.filter(
        (appointment) =>
          customerMissedStatus[appointment.customerEmail] === false ||
          customerMissedStatus[appointment.customerEmail] === undefined
      );
    }

    return filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeB.getTime() - dateTimeA.getTime();
    });
  }, [
    appointments,
    filterDate,
    filterService,
    filterProfessional,
    filterMissed,
    customerMissedStatus,
  ]);

  const handleToggleMissed = useCallback(
    async (
      id: string,
      customerEmail: string,
      currentAppointmentIsMissed: boolean,
      customerHasOverallMissedFlag: boolean
    ) => {
      if (!token) return;

      try {
        if (customerHasOverallMissedFlag) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/appointments/reset-missed-count/${customerEmail}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            toast("Faltas redefinidas", {
              description: `Todas as faltas para ${customerEmail} foram redefinidas.`,
            });
            // Após redefinir, o cliente não tem mais a flag de falta
            updateCustomerMissedStatus(customerEmail, false);
            // Atualizar também todos os agendamentos para este cliente como isMissed: false
            setAppointments((prevAppointments) =>
              prevAppointments.map((app) =>
                app.customerEmail === customerEmail
                  ? { ...app, isMissed: false }
                  : app
              )
            );
          } else {
            toast.error("Erro ao redefinir faltas", {
              description: "Não foi possível redefinir as faltas do cliente.",
            });
          }
        } else {
          // Ação: "Marcar com falta" -> chamar toggle-missed para este agendamento específico
          const newMissedStatus = !currentAppointmentIsMissed; // Isso se tornará true
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/appointment/toggle-missed/${id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ isMissed: newMissedStatus }),
            }
          );

          if (response.ok) {
            toast("Status de falta atualizado", {
              description: `Agendamento ${
                newMissedStatus ? "marcado com falta" : "removido da falta"
              } com sucesso`,
            });
            // Se este agendamento específico for marcado como falta,
            // atualizar o status geral do cliente para true
            updateCustomerMissedStatus(customerEmail, newMissedStatus); // Isso se tornará true
            setAppointments((prevAppointments) =>
              prevAppointments.map((app) =>
                app._id === id ? { ...app, isMissed: newMissedStatus } : app
              )
            );
          } else {
            toast.error("Erro ao atualizar status de falta", {
              description: "Não foi possível atualizar o status de falta",
            });
          }
        }
      } catch (error) {
        toast.error("Erro de rede", {
          description: "Não foi possível conectar ao servidor.",
        });
        console.error("Network error:", error);
      }
    },
    [token, setAppointments, updateCustomerMissedStatus]
  );

  const columns: ColumnDef<Appointment>[] = useMemo(
    () => [
      {
        accessorKey: "serviceId",
        header: "Serviço",
        cell: ({ row }) => {
          return <div>{row.original.serviceId.name}</div>;
        },
        enableHiding: false,
      },
      {
        accessorKey: "professionalId",
        header: "Profissional",
        cell: ({ row }) => {
          return <div>{row.original.professionalId.name}</div>;
        },
      },
      {
        accessorKey: "date",
        header: "Data",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(row.original.date)}
            </div>
          );
        },
      },
      {
        accessorKey: "time",
        header: "Hora",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {row.original.time}
            </div>
          );
        },
      },
      {
        accessorKey: "customerName",
        header: "Cliente",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5 w-[140px] text-muted-foreground">
              <User className="h-3 w-3" />
              <p className="truncate">{row.original.customerName}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "customerPhone",
        header: "Tel",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-3 w-3" />
              {row.original.customerPhone}
            </div>
          );
        },
      },
      {
        id: "missed",
        header: "Falta",
        cell: ({ row }) => {
          const hasCustomerMissedFlag =
            customerMissedStatus[row.original.customerEmail];
          return (
            <div>
              {hasCustomerMissedFlag && (
                <Flag className="h-4 w-4 text-red-500" />
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          return row.original.status === "FINISHED" ? (
            <div className="bg-primary/80 px-1.5 py-1.5 rounded text-xs text-white text-center">
              Finished
            </div>
          ) : (
            <div className="bg-primary/30 px-1.5 py-1.5 rounded text-xs text-white text-center">
              Canceled
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const appointment = row.original;
          const hasCustomerMissedFlag =
            customerMissedStatus[appointment.customerEmail];

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                  size="icon"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    handleToggleMissed(
                      appointment._id,
                      appointment.customerEmail,
                      appointment.isMissed,
                      hasCustomerMissedFlag
                    )
                  }
                >
                  <Flag className="mr-2 h-4 w-4" />
                  {hasCustomerMissedFlag
                    ? "Remover falta"
                    : "Marcar com falta"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableHiding: false,
      },
    ],
    [customerMissedStatus, handleToggleMissed]
  );

  const table = useReactTable({
    data: filteredAppointments,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4 pb-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Linhas por página
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para primeira página</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para próxima página</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para última página</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
