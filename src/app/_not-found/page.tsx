import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Página não encontrada</h1>
      <p className="mb-6">Desculpe, a página que você está procurando não existe.</p>

      <Link 
        href="/" 
        className="px-4 py-2 bg-neutral-600 text-neutral-50 rounded hover:bg-neutral-700 transition-colors"
      >
        Voltar para a página inicial
      </Link>
    </div>
  )
}