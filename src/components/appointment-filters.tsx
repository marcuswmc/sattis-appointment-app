"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, Search, X } from "lucide-react";
import { format } from "date-fns";
import { pt, ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function AppointmentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [date, setDate] = useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date") as string) : undefined,
  );
  const [service, setService] = useState<string>(searchParams.get("service") || "");
  const [professional, setProfessional] = useState<string>(searchParams.get("professional") || "");
  const [services, setServices] = useState<{ _id: string; name: string }[]>([]);
  const [professionals, setProfessionals] = useState<{ _id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [servicesRes, professionalsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/professionals`),
        ]);

        if (servicesRes.ok && professionalsRes.ok) {
          const servicesData = await servicesRes.json();
          const professionalsData = await professionalsRes.json();

          setServices(servicesData);
          setProfessionals(professionalsData);
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiltersData();
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (date) {
      params.set("date", date.toISOString().split("T")[0]);
    }

    if (service) {
      params.set("service", service);
    }

    if (professional) {
      params.set("professional", professional);
    }

    router.push(`/dashboard/appointments?${params.toString()}`);
  };

  const clearFilters = () => {
    setDate(undefined);
    setService("");
    setProfessional("");
    router.push("/dashboard/appointments");
  };

  // Conteúdo comum dos filtros
  const FiltersContent = (
    <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex justify-start text-left font-normal cursor-pointer w-full md:w-auto",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            locale={pt}
            selected={date}
            onSelect={setDate}
            className="bg-white rounded-md"
          />
        </PopoverContent>
      </Popover>

      <Select value={service} onValueChange={setService}>
        <SelectTrigger className="w-full md:w-auto cursor-pointer focus:outline-hidden">
          <SelectValue placeholder="Serviço" />
        </SelectTrigger>
        <SelectContent>
          {services.map((item) => (
            <SelectItem key={item._id} value={item._id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={professional} onValueChange={setProfessional}>
        <SelectTrigger className="w-full md:w-auto cursor-pointer">
          <SelectValue placeholder="Profissional" />
        </SelectTrigger>
        <SelectContent>
          {professionals.map((item) => (
            <SelectItem key={item._id} value={item._id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={applyFilters}
        className="flex items-center gap-2 bg-gray-950 text-gray-50 cursor-pointer w-full md:w-auto"
      >
        <Search className="h-4 w-4" />
        Filtrar
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Mobile: exibe o botão que abre o sheet */}
      <div className="md:hidden w-full">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-between">
              <span className="text-gray-500">Busque por: data, serviço ou profissional..</span>
              <Filter className="h-6 w-6 text-gray-500" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="sm:rounded-t-lg bg-white p-4">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{FiltersContent}</div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-6 w-6" />
                Limpar
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: exibe os filtros inline */}
      <div className="hidden md:flex w-full items-center justify-between">
        {FiltersContent}
        <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
