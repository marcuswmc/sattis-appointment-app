"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export interface Service {
  _id: string
  name: string
  description: string
  price: number
  duration: number
  availableTimes: string[]
}

export interface Professional {
  _id: string;
  name: string;
  services: Service[]
}

export interface Appointment {
  _id: string;
  date: string;
  time: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: Service;
  professionalId: Professional;
}

type AppointmentsContextType = {
  confirmedCount: number;
  appointments: Appointment[];
  services: Service[];
  professionals: Professional[];
  isLoading: boolean;
  fetchAppointments: (token: string | undefined, statuses?: string[]) => Promise<void>;
  fetchServicesAndProfessionals: (token: string | undefined) => Promise<void>;
  setAppointments: (value: Appointment[] | ((prev: Appointment[]) => Appointment[])) => void;
};

const defaultContext: AppointmentsContextType = {
  confirmedCount: 0,
  appointments: [],
  services: [],
  professionals: [],
  isLoading: false,
  fetchAppointments: async () => {},
  fetchServicesAndProfessionals: async () => {},
  setAppointments: () => {},
};

const AppointmentsContext = createContext<AppointmentsContextType>(defaultContext);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();

  // Busca de agendamentos
  const fetchAppointments = useCallback(
    async (token: string | undefined, statuses?: string[]) => {
      if (!token) return;
      setIsLoading(true);
      try {
        const params = new URLSearchParams();

        const statusFilter = statuses ? statuses.join(",") : "CONFIRMED";
        params.set("status", statusFilter);

        const date = searchParams.get("date");
        const service = searchParams.get("service");
        const professional = searchParams.get("professional");

        if (date) params.set("date", date);
        if (service) params.set("service", service);
        if (professional) params.set("professional", professional);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/appointments?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAppointments(data);
        } else {
          console.error("Erro ao carregar os agendamentos");
        }
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchParams]
  );

  // Busca de serviços e profissionais
  const fetchServicesAndProfessionals = useCallback(async (token: string | undefined) => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Busca serviços
      const servicesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData);
      } else {
        console.error("Erro ao carregar serviços");
      }

      // Busca profissionais
      const professionalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/professionals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (professionalsResponse.ok) {
        const professionalsData = await professionalsResponse.json();
        setProfessionals(professionalsData);
      } else {
        console.error("Erro ao carregar profissionais");
      }
    } catch (error) {
      console.error("Erro ao buscar serviços e profissionais:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Contagem de agendamentos confirmados
  const confirmedCount = appointments.reduce((count, appointment) => {
    return appointment.status === "CONFIRMED" ? count + 1 : count;
  }, 0);

  return (
    <AppointmentsContext.Provider
      value={{
        confirmedCount,
        appointments,
        services,
        professionals,
        isLoading,
        fetchAppointments,
        fetchServicesAndProfessionals,
        setAppointments,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
}

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error("useAppointments deve ser usado dentro de um AppointmentsProvider");
  }
  return context;
};
