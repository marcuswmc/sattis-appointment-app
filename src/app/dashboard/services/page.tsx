import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ServiceList } from "@/components/service-list"
import { CreateServiceButton } from "@/components/create-service-button"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function ServicesPage() {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard/appointments")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos pelo salão</p>
        </div>
        <CreateServiceButton />
      </div>

      <Suspense fallback={<ServiceListSkeleton />}>
        <ServiceList token={session?.user.accessToken} />
      </Suspense>
    </div>
  )
}

function ServiceListSkeleton() {
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
  )
}

