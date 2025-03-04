"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateProfessionalDialog } from "@/components/create-professional-dialog"

export function CreateProfessionalButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-1">
        <Plus className="h-4 w-4" />
        Novo profissional
      </Button>

      <CreateProfessionalDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

