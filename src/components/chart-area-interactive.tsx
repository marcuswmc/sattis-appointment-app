"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { format, subDays, parseISO, isAfter, isBefore, isEqual, startOfDay } from "date-fns"

import { useIsMobile } from "@/hooks/use-mobile"
import { useAppointments } from "@/hooks/appointments-context"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "Gráfico interativo de agendamentos"

const chartConfig = {
  confirmed: {
    label: "Confirmados",
    color: "hsl(var(--chart-1))",
  },
  completed: {
    label: "Concluídos",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const { appointments } = useAppointments()

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Processar dados dos appointments para o gráfico
  const chartData = React.useMemo(() => {
    const now = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = subDays(now, daysToSubtract)

    // Agrupar appointments por data
    const appointmentsByDate = new Map<string, { confirmed: number; completed: number }>()

    // Inicializar todas as datas no período com zero
    for (let i = 0; i <= daysToSubtract; i++) {
      const date = subDays(now, i)
      const dateKey = format(date, "yyyy-MM-dd")
      appointmentsByDate.set(dateKey, { confirmed: 0, completed: 0 })
    }

    // Processar appointments
    appointments.forEach((apt) => {
      try {
        const appointmentDate = startOfDay(parseISO(apt.date))
        const startDateDay = startOfDay(startDate)
        
        if (isAfter(appointmentDate, startDateDay) || isEqual(appointmentDate, startDateDay)) {
          const dateKey = format(appointmentDate, "yyyy-MM-dd")
          const current = appointmentsByDate.get(dateKey) || { confirmed: 0, completed: 0 }
          
          if (apt.status === "CONFIRMED") {
            current.confirmed++
          } else if (apt.status === "COMPLETED") {
            current.completed++
          }
          
          appointmentsByDate.set(dateKey, current)
        }
      } catch (error) {
        console.error("Erro ao processar data do appointment:", error)
      }
    })

    // Converter para array e ordenar por data
    return Array.from(appointmentsByDate.entries())
      .map(([date, counts]) => ({
        date,
        confirmed: counts.confirmed,
        completed: counts.completed,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [appointments, timeRange])

  const filteredData = chartData

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Agendamentos</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total de agendamentos nos últimos 3 meses
          </span>
          <span className="@[540px]/card:hidden">Últimos 3 meses</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Selecionar período"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 dias
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 dias
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillConfirmed" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-confirmed)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-confirmed)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = parseISO(value)
                return format(date, "dd/MM")
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return format(parseISO(value), "dd/MM/yyyy")
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="completed"
              type="natural"
              fill="url(#fillCompleted)"
              stroke="var(--color-completed)"
              stackId="a"
            />
            <Area
              dataKey="confirmed"
              type="natural"
              fill="url(#fillConfirmed)"
              stroke="var(--color-confirmed)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
