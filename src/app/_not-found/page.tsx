"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// Componente para lidar com search params
function SearchParamsHandler() {
  const searchParams = useSearchParams()
  return null
}

function NotFoundContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Página não encontrada</h1>
      <p className="mb-6">Desculpe, a página que você está procurando não existe.</p>

      <Link 
        href="/" 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Voltar para a página inicial
      </Link>
    </div>
  )
}

export default function NotFoundPage() {
  return (
    <Suspense fallback={null}>
      <>
        <SearchParamsHandler />
        <NotFoundContent />
      </>
    </Suspense>
  )
}