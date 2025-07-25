"use client";

import { useEffect, useCallback, useMemo, useRef, useState } from "react";
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
import {
  Loader2,
  MoreHorizontal,
  Calendar,
  Clock,
  Phone,
  User,
  Flag,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useAppointments } from "@/hooks/appointments-context";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";

interface HistoryListProps {
  token: string | undefined;
}

const ITEMS_PER_PAGE = 20;

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

  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const historyStatuses = ["FINISHED", "CANCELED"];
    const missedFilter = searchParams.get("missed");

    if (missedFilter === "true") {
      fetchAppointments(token, ["CONFIRMED", "FINISHED", "CANCELED"]);
    } else {
      fetchAppointments(token, historyStatuses);
    }
  }, [token, fetchAppointments, searchParams]);

  useEffect(() => {
    setDisplayedItems(ITEMS_PER_PAGE);
  }, [searchParams]);

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

  const displayedAppointments = useMemo(() => {
    return filteredAppointments.slice(0, displayedItems);
  }, [filteredAppointments, displayedItems]);

  const hasMore = displayedItems < filteredAppointments.length;

  const loadMoreItems = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      setDisplayedItems((prev) =>
        Math.min(prev + ITEMS_PER_PAGE, filteredAppointments.length)
      );
      setIsLoadingMore(false);
    }, 200);
  }, [hasMore, isLoadingMore, filteredAppointments.length]);

  const lastItemRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMoreItems();
          }
        },
        {
          threshold: 0.1,
          rootMargin: "100px",
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMoreItems]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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

  const AppointmentRow = useCallback(
    ({ appointment, index }: { appointment: any; index: number }) => {
      const isLast = index === displayedAppointments.length - 1;
      const hasCustomerMissedFlag =
        customerMissedStatus[appointment.customerEmail];

      return (
        <TableRow
          ref={isLast && hasMore ? lastItemRef : null}
          className="hover:bg-gray-100 transition-colors"
        >
          <TableCell>{appointment.serviceId.name}</TableCell>
          <TableCell>{appointment.professionalId.name}</TableCell>
          <TableCell>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-gray-500" />
              {formatDate(appointment.date)}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-gray-500" />
              {appointment.time}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1.5 w-[140px]">
              <User className="h-3 w-3 text-gray-500" />
              <p className="truncate">{appointment.customerName}</p>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-gray-500" />
              {appointment.customerPhone}
            </div>
          </TableCell>
          <TableCell>
            {hasCustomerMissedFlag && <Flag className="h-4 w-4 text-red-500" />}
          </TableCell>
          <TableCell>
            {appointment.status === "FINISHED" ? (
              <div className="bg-primary/80 px-1.5 py-1.5 rounded text-xs text-white text-center">
                Finished
              </div>
            ) : (
              <div className="bg-primary/30 px-1.5 py-1.5 rounded text-xs text-white text-center">
                Canceled
              </div>
            )}
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    handleToggleMissed(
                      appointment._id,
                      appointment.customerEmail,
                      appointment.isMissed,
                      hasCustomerMissedFlag // Passando o novo argumento
                    )
                  }
                >
                  <Flag className="mr-2 h-4 w-4" />
                  {hasCustomerMissedFlag ? "Remover falta" : "Marcar com falta"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      );
    },
    [
      displayedAppointments.length,
      hasMore,
      lastItemRef,
      customerMissedStatus,
      handleToggleMissed,
    ]
  );

  const AppointmentCard = useCallback(
    ({ appointment, index }: { appointment: any; index: number }) => {
      const isLast = index === displayedAppointments.length - 1;
      const hasCustomerMissedFlag =
        customerMissedStatus[appointment.customerEmail];

      return (
        <Card
          key={appointment._id}
          ref={isLast && hasMore ? lastItemRef : null}
          className="border border-gray-200 py-2 px-3"
        >
          <CardHeader className="pb-1 pt-0 px-0">
            <CardTitle className="text-sm font-semibold flex justify-between items-center">
              <span className="truncate flex items-center gap-2">
                {appointment.serviceId.name}
              </span>
              <div className="flex gap-2">
                <div className="my-auto">
                  {hasCustomerMissedFlag && (
                    <Flag className="h-4 w-4 text-red-500" />
                  )}
                </div>
                {appointment.status === "FINISHED" ? (
                  <div className="bg-primary/80 px-1.5 py-1 rounded text-xs text-white grid content-center">
                    Finished
                  </div>
                ) : (
                  <div className="bg-primary/30 px-1.5 py-1 rounded text-xs text-white grid content-center">
                    Canceled
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 border p-0 bg-primary-foreground"
                    >
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        handleToggleMissed(
                          appointment._id,
                          appointment.customerEmail,
                          appointment.isMissed,
                          hasCustomerMissedFlag // Passando o novo argumento
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
              </div>
            </CardTitle>
            <p className="text-xs text-gray-700 truncate">
              {appointment.professionalId.name}
            </p>
          </CardHeader>
          <CardContent className="pt-1 px-0 pb-0">
            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-500" />
                {formatDate(appointment.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-500" />
                {appointment.time}
              </span>
            </div>
            <div className="text-xs font-medium text-gray-800 flex items-center gap-1">
              <User className="h-3 w-3 text-gray-500" />
              <span className="truncate">{appointment.customerName}</span>
            </div>
          </CardContent>
        </Card>
      );
    },
    [
      displayedAppointments.length,
      hasMore,
      lastItemRef,
      customerMissedStatus,
      handleToggleMissed,
    ]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {filteredAppointments.length > 0 && (
        <div className="mb-4 text-sm text-muted-foreground flex-shrink-0">
          Mostrando {displayedAppointments.length} de{" "}
          {filteredAppointments.length} agendamentos
        </div>
      )}
      <ScrollArea className="h-[56vh] md:h-[600px]">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[18%]">Serviço</TableHead>
                <TableHead className="w-[15%]">Profissional</TableHead>
                <TableHead className="w-[12%]">Data</TableHead>
                <TableHead className="w-[10%]">Hora</TableHead>
                <TableHead className="w-[18%]">Cliente</TableHead>
                <TableHead className="w-[12%]">Tel</TableHead>
                <TableHead className="w-[5%]">Falta</TableHead>
                <TableHead className="w-[5%]">Status</TableHead>
                <TableHead className="w-[5%]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedAppointments.length > 0 ? (
                displayedAppointments.map((appointment, index) => (
                  <AppointmentRow
                    key={appointment._id}
                    appointment={appointment}
                    index={index}
                  />
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

          {isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">
                Carregando...
              </span>
            </div>
          )}

          {hasMore && !isLoadingMore && displayedAppointments.length > 0 && (
            <div className="flex justify-center py-6">
              <Button variant="outline" onClick={loadMoreItems} className="">
                Carregar mais
              </Button>
            </div>
          )}
        </div>

        <div className="md:hidden space-y-2">
          {displayedAppointments.length > 0 ? (
            displayedAppointments.map((appointment, index) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                index={index}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum agendamento encontrado.
            </div>
          )}

          {isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">
                Carregando mais agendamentos...
              </span>
            </div>
          )}

          {hasMore && !isLoadingMore && displayedAppointments.length > 0 && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                onClick={loadMoreItems}
                className="w-full"
              >
                Carregar mais agendamentos
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
