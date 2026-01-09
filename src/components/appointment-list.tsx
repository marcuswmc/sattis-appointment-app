"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Check,
  X,
  Loader2,
  MoreHorizontal,
  Calendar,
  Clock,
  Phone,
  User,
  Flag,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useAppointments, type Appointment } from "@/hooks/appointments-context";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickFilter } from "./quick-filter";
import { addDays } from "date-fns";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
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

interface AppointmentListProps {
  token: string | undefined;
}

const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function AppointmentList({ token }: AppointmentListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    appointments,
    isLoading,
    fetchAppointments,
    setAppointments,
    customerMissedStatus,
    updateCustomerMissedStatus,
  } = useAppointments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "date",
      desc: false,
    },
  ]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Derivando o valor de data diretamente dos searchParams
  const dateFromParams = searchParams.get("date");
  const currentDateFilter = dateFromParams ? new Date(dateFromParams) : undefined;

  const setToday = useCallback(() => {
    router.push(
      `/dashboard/appointments?date=${formatDateToLocalString(new Date())}`
    );
  }, [router]);

  const setTomorrow = useCallback(() => {
    router.push(
      `/dashboard/appointments?date=${formatDateToLocalString(
        addDays(new Date(), 1)
      )}`
    );
  }, [router]);

  // Único useEffect para carregar agendamentos ao mudar os filtros (searchParams)
  useEffect(() => {
    const currentStatuses = ["CONFIRMED"];
    fetchAppointments(token, currentStatuses);
  }, [token, fetchAppointments, searchParams]);

  const filterDate = searchParams.get("date");
  const filterService = searchParams.get("service");
  const filterProfessional = searchParams.get("professional");
  const filterMissed = searchParams.get("missed");

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(
      (appointment) => appointment.status === "CONFIRMED"
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
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
  }, [
    appointments,
    filterDate,
    filterService,
    filterProfessional,
    filterMissed,
    customerMissedStatus,
  ]);

  const handleCancelAppointment = useCallback((id: string) => {
    setSelectedAppointmentId(id);
    setIsModalOpen(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!selectedAppointmentId || !token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointment/${selectedAppointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "CANCELED" }),
        }
      );

      if (response.ok) {
        toast("Agendamento cancelado", {
          description: "O agendamento foi cancelado com sucesso.",
        });
        setAppointments((prevAppointments) =>
          prevAppointments.map((app) =>
            app._id === selectedAppointmentId
              ? { ...app, status: "CANCELED" }
              : app
          )
        );
      } else {
        toast.error("Erro ao cancelar agendamento", {
          description: "Não foi possível cancelar o agendamento.",
        });
      }
    } catch (error) {
      toast.error("Erro ao cancelar agendamento", {
        description: "Não foi possível cancelar o agendamento.",
      });
    } finally {
      setIsModalOpen(false);
      setSelectedAppointmentId(null);
    }
  }, [selectedAppointmentId, token, setAppointments]);

  const handleFinishAppointment = useCallback(
    async (id: string) => {
      if (!token) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/appointment/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "FINISHED" }),
          }
        );

        if (response.ok) {
          toast("Agendamento finalizado", {
            description: "O agendamento foi finalizado com sucesso.",
          });
          setAppointments((prevAppointments) =>
            prevAppointments.map((app) =>
              app._id === id ? { ...app, status: "FINISHED" } : app
            )
          );
        } else {
          toast.error("Erro ao finalizar agendamento", {
            description: "Não foi possível finalizar o agendamento.",
          });
        }
      } catch (error) {
        toast.error("Erro ao finalizar agendamento", {
          description: "Não foi possível finalizar o agendamento.",
        });
      }
    },
    [token, setAppointments]
  );

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
          // Ação: "Remover falta" -> chamar reset-missed-count
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
            updateCustomerMissedStatus(customerEmail, false);
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
          // Ação: "Marcar com falta" -> chamar toggle-missed
          const newMissedStatus = !currentAppointmentIsMissed;
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
            updateCustomerMissedStatus(customerEmail, newMissedStatus);
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
                  onClick={() => handleFinishAppointment(appointment._id)}
                >
                  <Check className="mr-2 h-4 w-4" /> Finalizar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCancelAppointment(appointment._id)}
                >
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </DropdownMenuItem>
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
    [customerMissedStatus, handleFinishAppointment, handleCancelAppointment, handleToggleMissed]
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
      <div className="flex items-center justify-between md:justify-end">
        <div className="md:hidden">
          <QuickFilter
            setToday={setToday}
            setTomorrow={setTomorrow}
            date={currentDateFilter}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden lg:inline">Personalizar Colunas</span>
                <span className="lg:hidden">Colunas</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "serviceId"
                        ? "Serviço"
                        : column.id === "professionalId"
                        ? "Profissional"
                        : column.id === "customerName"
                        ? "Cliente"
                        : column.id === "customerPhone"
                        ? "Tel"
                        : column.id === "missed"
                        ? "Falta"
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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

        <div className="flex items-center justify-between px-4">
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
  );
}