"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Professional,
  Service,
  useAppointments,
} from "@/hooks/appointments-context";
import { toast } from "sonner";
import Image from "next/image";
import logo from "@/public/sattis-logo.png";
import { Loader2 } from "lucide-react";

const AppointmentForm = () => {
  const {
    services,
    professionals,
    appointments,
    fetchServicesAndProfessionals,
    fetchAppointments,
  } = useAppointments();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>("");
  const [availableProfessionals, setAvailableProfessionals] = useState<
    Professional[]
  >([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServicesAndProfessionals(undefined);
    fetchAppointments(undefined);
  }, [fetchServicesAndProfessionals, fetchAppointments]);

  useEffect(() => {
    if (selectedService) {
      const professionalsForService = (professionals || []).filter((pro) =>
        pro.services.some((s) => s._id === selectedService)
      );
      setAvailableProfessionals(professionalsForService);
    }
  }, [selectedService, professionals]);

 
  useEffect(() => {
    if (selectedService && formData.date && selectedProfessional) {
      const fetchAvailableTimes = async () => {
        try {
          const response = await fetch(
            `http://localhost:10000/api/services/available?date=${formData.date}`
          );
          if (!response.ok) throw new Error("Erro ao buscar horários disponíveis");
    
          const data = await response.json();
    
          const service = data.find((s: Service) => s._id === selectedService);
    
          if (!service) {
            setAvailableTimes([]);
            return;
          }
    
          const professionalBookedTimes = appointments
            .filter(
              (appt) =>
                appt.professionalId?. _id === selectedProfessional &&
                appt.date === formData.date &&
                appt.status === "CONFIRMED"
            )
            .map((appt) => appt.time);

          const freeTimes = service.availableTimes.filter(
            (time: string) => !professionalBookedTimes.includes(time)
          );
    
          setAvailableTimes(freeTimes);
        } catch (error) {
          console.error(error);
          setAvailableTimes([]);
        }
      };
    
      fetchAvailableTimes();
    }
  }, [selectedService, formData.date, selectedProfessional, appointments]);
  
  

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      ...formData,
      serviceId: selectedService,
      professionalId: selectedProfessional,
      time: selectedTime,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointment/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast("Agendamento realizado com sucesso!");
        setStep(5);
      } else {
        toast("Erro ao agendar. Tente novamente!");
      }
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast("Erro ao agendar. Tente novamente!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full md:w-lg p-6 flex-col mx-auto space-y-6 h-svh justify-center">
      <div className="mx-auto">
        <Image src={logo} width={100} quality={100} alt="Sattis Studio" />
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-medium">Sattis Studio</h2>
        <p className="text-sm text-foreground">
          Olá, escolha um serviço e faça sua marcação
        </p>
      </div>

      {/* Step 1: Escolha do Serviço */}
      {step === 1 && (
        <Card className="border-none shadow-none">
          <CardHeader className="items-center">
            <CardTitle>Escolha um serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {services.map((service: Service) => (
                <Button
                  key={service._id}
                  variant="outline"
                  className={`${
                    selectedService === service._id ? "bg-gray-300" : ""
                  }`}
                  onClick={() => setSelectedService(service._id)}
                >
                  {service.name}
                </Button>
              ))}
            </div>
            <Button
              className="mt-10 w-full"
              onClick={() => setStep(2)}
              disabled={!selectedService}
            >
              Próximo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Escolha do Profissional */}
      {step === 2 && (
        <Card className="border-none shadow-none">
          <CardHeader className="items-center">
            <CardTitle>Escolha um profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {availableProfessionals.map((pro) => (
                <Button
                  key={pro._id}
                  variant="outline"
                  className={`${
                    selectedProfessional === pro._id ? "bg-gray-300" : ""
                  }`}
                  onClick={() => setSelectedProfessional(pro._id)}
                >
                  {pro.name}
                </Button>
              ))}
            </div>
            <Button
              className="mt-10 w-full"
              onClick={() => setStep(3)}
              disabled={!selectedProfessional}
            >
              Próximo
            </Button>
            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => setStep(1)}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Escolha da Data e Horário */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Escolha uma data e um horário</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              className="mt-4 w-full"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
            <div className="grid grid-cols-3 gap-3 mt-4">
              {availableTimes.length > 0 ? (
                availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    className={`${selectedTime === time ? "bg-gray-300" : ""}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))
              ) : (
                <p className="col-span-3 text-sm text-muted-foreground">
                  Nenhum horário disponível para esta data.
                </p>
              )}
            </div>
            <Button
              className="mt-10 w-full"
              onClick={() => setStep(4)}
              disabled={!selectedTime || !formData.date}
            >
              Próximo
            </Button>
            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => setStep(2)}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Dados do Cliente */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Seus dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Nome*</Label>
              <Input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
              />
              <Label>Email*</Label>
              <Input
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
              />
              <Label>Telefone*</Label>
              <Input
                type="text"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
              />
            </div>
            <Button className="mt-10 w-full" onClick={handleSubmit}>
              {loading ? (
                <Loader2 className="h-10 w-10 animate-spin text-gray-50" />
              ) : (
                "Confirmar Marcação"
              )}
            </Button>
            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => setStep(3)}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Confirmação */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Marcação Confirmada! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm mb-2">Resumo da marcação:</p>
            <p>
              <strong>Serviço:</strong>{" "}
              {services.find((s) => s._id === selectedService)?.name}
            </p>
            <p>
              <strong>Profissional:</strong>{" "}
              {professionals.find((p) => p._id === selectedProfessional)?.name}
            </p>
            <p>
              <strong>Data:</strong> {formData.date}
            </p>
            <p>
              <strong>Hora:</strong> {selectedTime}
            </p>
            <p>
              <strong>Nome:</strong> {formData.customerName}
            </p>
            <p>
              <strong>Email:</strong> {formData.customerEmail}
            </p>
            <p>
              <strong>Telefone:</strong> {formData.customerPhone}
            </p>
            <Button className="mt-10 w-full" onClick={() => setStep(1)}>
              Nova Marcação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentForm;
