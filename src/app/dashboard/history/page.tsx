import { auth } from "@/lib/auth";
import HistoryList from "@/components/history-list";

import { HistoryFilters } from "@/components/history-filters";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function HistorPage() {
  const session = await auth();
  const acesstoken = session?.user.accessToken

  return (
    <>
      <div className="space-y-6 overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico</h2>
          <p className="text-muted-foreground">
            Visualize todos os apontamentos finalizados ou cancelados
          </p>
        </div>
        <div>
          <HistoryFilters token={acesstoken}/>
        </div>
        <Suspense fallback={<HistoryListSkeleton />}>
          <HistoryList token={acesstoken} />
        </Suspense>
      </div>
    </>
  );
}

function HistoryListSkeleton() {
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
