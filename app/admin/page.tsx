"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Eye, EyeOff, RotateCcw, Delete } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { getAllTickets, getDeletedTickets, deleteTicket, restoreTicket, permanentlyDeleteTicket, Ticket } from "@/lib/ticketService"

export default function AdminPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [deletedTickets, setDeletedTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState<"all" | "valid" | "used">("all")
  const [showStats, setShowStats] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Vérifier l'authentification
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    loadTickets()
    const interval = setInterval(loadTickets, 5000) // Rafraîchir toutes les 5 secondes
    return () => clearInterval(interval)
  }, [showTrash])

  const loadTickets = async () => {
    try {
      setLoading(true)
      if (showTrash) {
        const deleted = await getDeletedTickets()
        setDeletedTickets(deleted)
      } else {
        const allTickets = await getAllTickets()
        setTickets(allTickets)
      }
      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des billets"
      // Vérifier si l'erreur est liée à la configuration de Supabase
      if (errorMessage.includes('Supabase is not configured')) {
        setError("La base de données n'est pas configurée. Veuillez configurer les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.")
      } else {
        setError(errorMessage)
      }
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "all") return true
    if (filter === "valid") return ticket.status === "valid"
    if (filter === "used") return ticket.status === "used"
    return true
  })

  const moveToTrash = async (id: string) => {
    try {
      await deleteTicket(id)
      setTickets(tickets.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression du billet")
    }
  }

  const restoreFromTrash = async (id: string) => {
    try {
      await restoreTicket(id)
      setDeletedTickets(deletedTickets.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la restauration du billet")
    }
  }

  const permanentlyDelete = async (id: string) => {
    try {
      await permanentlyDeleteTicket(id)
      setDeletedTickets(deletedTickets.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression définitive du billet")
    }
  }

  const revokeTicket = async (id: string) => {
    try {
      // Note: Pour révoquer un billet, nous pourrions vouloir le marquer comme "used"
      // Mais pour l'instant, nous gardons la même logique
      setTickets(tickets.map(ticket => 
        ticket.id === id ? {...ticket, status: "used" as const} : ticket
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la révocation du billet")
    }
  }

  const stats = {
    total: tickets.length,
    used: tickets.filter(t => t.status === "used").length,
    valid: tickets.filter(t => t.status === "valid").length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative">
      {/* Fond décoratif animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg px-3 py-2 transition-all font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t("admin.back")}</span>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("adminAuthenticated");
                router.push("/login");
              }}
              className="text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition-all font-medium"
            >
              {t("admin.logout")}
            </button>
          </div>
          <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center flex-1">
            {showTrash ? t("admin.trash") : t("admin.title")}
          </h1>
          <div className="flex gap-1.5">
            <button
              onClick={() => setShowTrash(!showTrash)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors text-xs font-medium flex-shrink-0"
            >
              {showTrash ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("admin.backToTickets")}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("admin.trash")}</span>
                </>
              )}
            </button>
            {!showTrash && (
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors text-xs font-medium flex-shrink-0"
              >
                {showStats ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{showStats ? t("admin.hide") : t("admin.show")}</span>
                <span className="sm:hidden">{showStats ? t("admin.hide") : t("admin.show")}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Stats Premium */}
        {!showTrash && showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-fade-in-scale">
            <div className="glass p-6 rounded-2xl text-center hover-lift transition-all duration-300 border border-purple-200/50">
              <div className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">{t("admin.totalTickets")}</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.total}</div>
            </div>
            <div className="glass p-6 rounded-2xl text-center hover-lift transition-all duration-300 border border-amber-200/50">
              <div className="text-xs font-semibold text-amber-600 mb-2 uppercase tracking-wide">{t("admin.used")}</div>
              <div className="text-4xl font-bold text-amber-600">{stats.used}</div>
            </div>
            <div className="glass p-6 rounded-2xl text-center hover-lift transition-all duration-300 border border-blue-200/50">
              <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">{t("admin.valid")}</div>
              <div className="text-4xl font-bold text-blue-600">{stats.valid}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        {!showTrash && (
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {(["all", "valid", "used"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1.5 rounded font-medium transition-all text-[10px] ${
                  filter === f ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {f === "all" ? t("admin.all") : f === "valid" ? t("admin.validFilter") : t("admin.usedFilter")}
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs mb-3">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-r-transparent"></div>
          </div>
        )}

        {/* Tickets Table */}
        <div className="rounded border border-gray-200 overflow-hidden bg-white">
          {showTrash ? (
            // Corbeille
            deletedTickets.length === 0 && !loading ? (
              <div className="p-6 text-center">
                <Trash2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-1">{t("admin.emptyTrash")}</h3>
                <p className="text-gray-500 text-xs">{t("admin.noDeletedTickets")}</p>
              </div>
            ) : !loading ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-900">{t("admin.ticketId")}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">{t("admin.participant")}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900 hidden sm:table-cell">
                        {t("admin.event")}
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">{t("admin.status")}</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-900">{t("admin.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedTickets.map((ticket) => {
                      const rowKey = `${ticket.id}-${ticket.createdat}`;
                      return (
                        <tr key={rowKey} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 text-gray-900 font-mono truncate text-[10px]">
                            {ticket.id.substring(0, 8)}...
                          </td>
                          <td className="px-3 py-2 text-gray-900 truncate text-[10px]">
                            {ticket.participantname}
                          </td>
                          <td className="px-3 py-2 text-gray-600 hidden sm:table-cell truncate text-[10px]">
                            {ticket.eventname}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                ticket.status === "used" 
                                  ? "bg-amber-100 text-amber-800" 
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {ticket.status === "used" ? t("ticket.used") : t("ticket.valid")}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              <button
                                onClick={() => restoreFromTrash(ticket.id)}
                                className="px-1.5 py-0.5 text-[10px] rounded border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium whitespace-nowrap"
                              >
                                <RotateCcw className="w-2.5 h-2.5 inline mr-0.5" />
                                <span className="hidden xs:inline">{t("admin.restore")}</span>
                              </button>
                              <button
                                onClick={() => permanentlyDelete(ticket.id)}
                                className="px-1.5 py-0.5 text-[10px] rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-medium whitespace-nowrap"
                              >
                                <Delete className="w-2.5 h-2.5 inline mr-0.5" />
                                <span className="hidden xs:inline">{t("admin.deletePermanently")}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null
          ) : (
            // Billets actifs
            filteredTickets.length === 0 && !loading ? (
              <div className="p-6 text-center">
                <p className="text-gray-600 text-xs font-light">{t("admin.noTickets")}</p>
              </div>
            ) : !loading ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-900">{t("admin.ticketId")}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">{t("admin.participant")}</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900 hidden sm:table-cell">
                        {t("admin.event")}
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900 hidden md:table-cell">
                        {t("admin.date")}
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">{t("admin.status")}</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-900">{t("admin.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => {
                      const isUsed = ticket.status === "used"
                      // Utiliser une clé composite pour garantir l'unicité
                      const rowKey = `${ticket.id}-${ticket.createdat}`;
                      return (
                        <tr key={rowKey} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 text-gray-900 font-mono truncate text-[10px]">
                            {ticket.id.substring(0, 8)}...
                          </td>
                          <td className="px-3 py-2 text-gray-900 truncate text-[10px]">
                            {ticket.participantname}
                          </td>
                          <td className="px-3 py-2 text-gray-600 hidden sm:table-cell truncate text-[10px]">
                            {ticket.eventname}
                          </td>
                          <td className="px-3 py-2 text-gray-600 hidden md:table-cell text-[10px]">
                            {new Date(ticket.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                isUsed ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {isUsed ? t("ticket.used") : t("ticket.valid")}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              {!isUsed && (
                                <button
                                  onClick={() => revokeTicket(ticket.id)}
                                  className="px-1.5 py-0.5 text-[10px] rounded border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium whitespace-nowrap"
                                >
                                  <span className="hidden xs:inline">{t("admin.revoke")}</span>
                                </button>
                              )}
                              <button
                                onClick={() => moveToTrash(ticket.id)}
                                className="px-1.5 py-0.5 text-[10px] rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-medium whitespace-nowrap"
                              >
                                <Trash2 className="w-2.5 h-2.5 inline mr-0.5" />
                                <span className="hidden xs:inline">{t("admin.delete")}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null
          )}
        </div>
      </div>
    </main>
  )
}