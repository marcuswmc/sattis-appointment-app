"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export interface Category {
  _id: string;
  name: string;
}

export interface Service {
  _id: string
  name: string
  description: string
  price: number
  duration: number
  category: string | Category
  availableTimes: string[]
}

export interface Professional {
  _id: string;
  name: string;
  services: Service[]
  image?: string
}

export interface Appointment {
  isMissed: boolean;
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
  categories: Category[];
  isLoading: boolean;
  fetchAppointments: (token: string | undefined, statuses?: string[]) => Promise<void>;
  fetchServicesAndProfessionals: (token: string | undefined) => Promise<void>;
  fetchCategories: (token: string | undefined) => Promise<void>;
  setAppointments: (value: Appointment[] | ((prev: Appointment[]) => Appointment[])) => void;
};

const defaultContext: AppointmentsContextType = {
  confirmedCount: 0,
  appointments: [],
  services: [],
  professionals: [],
  categories: [],
  isLoading: false,
  fetchAppointments: async () => {},
  fetchServicesAndProfessionals: async () => {},
  fetchCategories: async () => {},
  setAppointments: () => {},
};

const AppointmentsContext = createContext<AppointmentsContextType>(defaultContext);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();

  const fetchAppointments = useCallback(
    async (token: string | undefined, statuses?: string[]) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();

        const statusFilter = statuses ? statuses.join(",") : "CONFIRMED";
        params.set("status", statusFilter);

        const date = searchParams.get("date");
        const service = searchParams.get("service");
        const professional = searchParams.get("professional");
        const missed = searchParams.get("missed")

        if (date) params.set("date", date);
        if (service) params.set("service", service);
        if (professional) params.set("professional", professional);
        if (missed) params.set("isMissed", missed);

        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/appointments?${params.toString()}`,
          {
            headers,
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

  const fetchServicesAndProfessionals = useCallback(async (token?: string) => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const servicesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        headers,
      });

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData);
      } else {
        console.error("Erro ao carregar serviços");
      }

      const professionalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/professionals`, {
        headers,
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

  const fetchCategories = useCallback(async (token?: string) => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        headers,
      });

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } else {
        console.error("Erro ao carregar categorias");
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        categories,
        isLoading,
        fetchAppointments,
        fetchServicesAndProfessionals,
        fetchCategories,
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