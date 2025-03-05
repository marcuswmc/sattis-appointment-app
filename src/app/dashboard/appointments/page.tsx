import { auth } from "@/lib/auth";
import { AppointmentList } from "@/components/appointment-list";
import { AppointmentFilters } from "@/components/appointment-filters";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function AppointmentsPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Marcações</h2>
        <p className="text-muted-foreground">
          Gerencie todas as marcações confirmadas
        </p>
      </div>
      <div>
        <AppointmentFilters />
      </div>
      <Suspense fallback={<AppointmentsListSkeleton />}>
        <AppointmentList token={session?.user.accessToken} />
      </Suspense>
    </div>
  );
}

function AppointmentsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
