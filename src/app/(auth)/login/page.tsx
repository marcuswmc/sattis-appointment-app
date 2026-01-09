import { LoginForm } from "@/components/login-form"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"


export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect("/dashboard/appointments")
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex gap-2 justify-between items-center">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center">
               <Image src="/sattis-logo.png" alt="Sattis Logo" width={60} height={60}/>
            </div>
            Sattis Studio
          </a>
          <div>
            <ModeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/login-side-img.jpg"
          alt="Image"
          fill
          quality={100}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}

