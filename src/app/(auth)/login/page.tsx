import { LoginForm } from "@/components/login-form"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Image from "next/image"

import logo from "@/public/sattis-logo.png"

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect("/dashboard/appointments")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <Image src={logo} alt="Sattis Logo" width={100}/>
          <div>

          <h2 className="text-3xl font-bold">Sattis Studio</h2>
          <p className="text-muted-foreground">Entre para gerenciar suas marcações</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

