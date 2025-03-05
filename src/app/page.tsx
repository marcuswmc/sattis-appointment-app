"use client"

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { auth } from "@/lib/auth"

// Componente para lidar com search params
function SearchParamsHandler() {
  const searchParams = useSearchParams()
  return null
}

// Componente de redirecionamento
function RedirectComponent() {
  useEffect(() => {
    const checkSession = async () => {
      const session = await auth()
      
      if (!session) {
        redirect("/login")
      } else {
        redirect("/dashboard/appointments")
      }
    }

    checkSession()
  }, [])

  return <div>Redirecionando...</div>
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <>
        <SearchParamsHandler />
        <RedirectComponent />
      </>
    </Suspense>
  )
}