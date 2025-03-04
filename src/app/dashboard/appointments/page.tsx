import { auth } from "@/lib/auth"
import { AppointmentList } from "@/components/appointment-list"
import { AppointmentFilters } from "@/components/appointment-filters"


export default async function AppointmentsPage() {
  const session = await auth()


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Marcações</h2>
        <p className="text-muted-foreground">Gerencie todas as marcações confirmadas</p>
      </div>
        <div>
          <AppointmentFilters />
        </div>        
      <AppointmentList token={session?.user.accessToken} />
    </div>
  )
}

