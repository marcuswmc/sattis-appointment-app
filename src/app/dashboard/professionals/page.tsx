import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProfessionalList } from "@/components/professional-list"
import { CreateProfessionalButton } from "@/components/create-professional-button"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function ProfessionalsPage() {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard/appointments")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profissionais</h2>
          <p className="text-muted-foreground">Gerencie todos os profissionais</p>
        </div>
        <CreateProfessionalButton />
      </div>

      <Suspense fallback={<ProfessionalListSkeleton />}>
        <ProfessionalList token={session?.user.accessToken} />
      </Suspense>
    </div>
  )
}

function ProfessionalListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

