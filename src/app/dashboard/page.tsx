"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { useAppointments } from "@/hooks/appointments-context"

export default function Page() {
  const { data: session } = useSession()
  const { fetchAppointments, fetchServicesAndProfessionals } = useAppointments()

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchAppointments(session.user.accessToken)
      fetchServicesAndProfessionals(session.user.accessToken)
    }
  }, [session, fetchAppointments, fetchServicesAndProfessionals])

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
