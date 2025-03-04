"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateServiceDialog } from "@/components/create-service-dialog"

export function CreateServiceButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-1">
        <Plus className="h-4 w-4" />
        Novo serviço
      </Button>

      <CreateServiceDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

