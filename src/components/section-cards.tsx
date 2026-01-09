"use client"

import { useMemo } from "react"
import { IconTrendingUp, IconCalendar, IconUsers, IconScissors } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppointments } from "@/hooks/appointments-context"

export function SectionCards() {
  const { appointments, services, professionals, confirmedCount } = useAppointments()

  const stats = useMemo(() => {
    const totalAppointments = appointments.length
    const pendingAppointments = appointments.filter(
      (apt) => apt.status === "PENDING"
    ).length
    const completedAppointments = appointments.filter(
      (apt) => apt.status === "COMPLETED"
    ).length
    const totalRevenue = appointments
      .filter((apt) => apt.status === "COMPLETED")
      .reduce((sum, apt) => sum + (apt.serviceId?.price || 0), 0)

    return {
      totalAppointments,
      confirmedCount,
      pendingAppointments,
      completedAppointments,
      totalServices: services.length,
      totalProfessionals: professionals.length,
      totalRevenue,
    }
  }, [appointments, services, professionals, confirmedCount])

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Marcaciones Confirmadas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {confirmedCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Confirmadas
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Agendamentos confirmados <IconCalendar className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total de {stats.totalAppointments} marcações
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Marcaciones Pendentes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.pendingAppointments}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCalendar />
              Pendentes
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Aguardando confirmação <IconCalendar className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Requerem atenção
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Serviços</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalServices}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconScissors />
              Serviços
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Serviços disponíveis <IconScissors className="size-4" />
          </div>
          <div className="text-muted-foreground">Catálogo de serviços</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Profissionais</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalProfessionals}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers />
              Ativos
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Equipe ativa <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">Profissionais cadastrados</div>
        </CardFooter>
      </Card>
    </div>
  )
}
