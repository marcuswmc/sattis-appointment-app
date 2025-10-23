"use client";

import { Button } from "@/components/ui/button";
import { addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface QuickFilterProps {
  setToday: () => void;
  setTomorrow: () => void;
  date: Date | undefined;
}

export function QuickFilter({ setToday, setTomorrow, date }: QuickFilterProps) {
  const searchParams = useSearchParams();
  const urlDate = searchParams.get("date");

  const todayString = formatDateToLocalString(new Date());
  const tomorrowString = formatDateToLocalString(addDays(new Date(), 1));

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={setToday}
        className={cn(
          "cursor-pointer",
          urlDate === todayString && "bg-gray-950 text-white"
        )}
      >
        Hoje
      </Button>
      <Button
        variant="outline"
        onClick={setTomorrow}
        className={cn(
          "cursor-pointer",
          urlDate === tomorrowString && "bg-gray-950 text-white"
        )}
      >
        Amanhã
      </Button>
    </div>
  );
}
