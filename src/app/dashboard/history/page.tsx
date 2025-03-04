import { auth } from "@/lib/auth";
import HistoryList from "@/components/history-list";

import { HistoryFilters } from "@/components/history-filters";

export default async function HistorPage() {
  const session = await auth();

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico</h2>
          <p className="text-muted-foreground">
            Visualize todos os apontamentos finalizados ou cancelados
          </p>
        </div>
        <div>
          <HistoryFilters />
        </div>
        <HistoryList token={session?.user.accessToken} />
      </div>
      
    </>
  );
}
