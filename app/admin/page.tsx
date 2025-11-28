"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Trash2, Eye, EyeOff, RotateCcw, Delete } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { getAllTickets, getDeletedTickets, deleteTicket, restoreTicket, permanentlyDeleteTicket, Ticket } from "@/lib/ticketService"

export default function AdminPage() {
  const { t } = useLanguage()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [deletedTickets, setDeletedTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState<"all" | "valid" | "used">("all")
  const [showStats, setShowStats] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des billets")
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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 font-light text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t("admin.back")}</span>
          </Link>
          <h1 className="text-base sm:text-lg font-light text-gray-900 text-center flex-1 tracking-tight">
            {showTrash ? t("admin.trash") : t("admin.title")}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTrash(!showTrash)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors text-xs sm:text-sm font-medium flex-shrink-0"
            >
              {showTrash ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("admin.backToTickets")}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("admin.trash")}</span>
                </>
              )}
            </button>
            {!showTrash && (
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors text-xs sm:text-sm font-medium flex-shrink-0"
              >
                {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">{showStats ? t("admin.hide") : t("admin.show")}</span>
                <span className="sm:hidden text-xs">{showStats ? t("admin.hide") : t("admin.show")}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Stats */}
        {!showTrash && showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="p-5 sm:p-6 rounded border border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 mb-2 font-light">{t("admin.totalTickets")}</div>
              <div className="text-2xl sm:text-3xl font-light text-gray-900">{stats.total}</div>
            </div>
            <div className="p-5 sm:p-6 rounded border border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 mb-2 font-light">{t("admin.used")}</div>
              <div className="text-2xl sm:text-3xl font-light text-amber-600">{stats.used}</div>
            </div>
            <div className="p-5 sm:p-6 rounded border border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 mb-2 font-light">{t("admin.valid")}</div>
              <div className="text-2xl sm:text-3xl font-light text-blue-600">{stats.valid}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        {!showTrash && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {(["all", "valid", "used"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-2 rounded font-medium transition-all text-xs sm:text-sm ${
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
          <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-r-transparent"></div>
          </div>
        )}

        {/* Tickets Table */}
        <div className="rounded border border-gray-200 overflow-hidden bg-white">
          {showTrash ? (
            // Corbeille
            deletedTickets.length === 0 && !loading ? (
              <div className="p-6 sm:p-8 text-center">
                <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("admin.emptyTrash")}</h3>
                <p className="text-gray-500 text-sm">{t("admin.noDeletedTickets")}</p>
              </div>
            ) : !loading ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900">{t("admin.ticketId")}</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900">{t("admin.participant")}</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900 hidden sm:table-cell">
                        {t("admin.event")}
                      </th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900">{t("admin.status")}</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-right font-medium text-gray-900">{t("admin.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedTickets.map((ticket) => {
                      const rowKey = `${ticket.id}-${ticket.createdat}`;
                      return (
                        <tr key={rowKey} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-gray-900 font-mono truncate text-xs">
                            {ticket.id.substring(0, 10)}...
                          </td>
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-gray-900 truncate text-xs">
                            {ticket.participantname}
                          </td>
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-gray-600 hidden sm:table-cell truncate text-xs">
                            {ticket.eventname}
                          </td>
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                ticket.status === "used" 
                                  ? "bg-amber-100 text-amber-800" 
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {ticket.status === "used" ? t("ticket.used") : t("ticket.valid")}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-right">
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              <button
                                onClick={() => restoreFromTrash(ticket.id)}
                                className="px-2 py-1 text-xs rounded border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium whitespace-nowrap"
                              >
                                <RotateCcw className="w-3 h-3 inline mr-1" />
                                {t("admin.restore")}
                              </button>
                              <button
                                onClick={() => permanentlyDelete(ticket.id)}
                                className="px-2 py-1 text-xs rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-medium whitespace-nowrap"
                              >
                                <Delete className="w-3 h-3 inline mr-1" />
                                {t("admin.deletePermanently")}
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
              <div className="p-6 sm:p-8 text-center">
                <p className="text-gray-600 text-xs sm:text-sm font-light">{t("admin.noTickets")}</p>
              </div>
            ) : !loading ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900">{t("admin.ticketId")}</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900">{t("admin.participant")}</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900 hidden sm:table-cell">
                        {t("admin.event")}
                      </th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900 hidden md:table-cell">
                        {t("admin.date")}
                      </th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900">{t("admin.status")}</th>
                      <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-right font-medium text-gray-900">{t("admin.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => {
                      const isUsed = ticket.status === "used"
                      // Utiliser une clé composite pour garantir l'unicité
                      const rowKey = `${ticket.id}-${ticket.createdat}`;
                      return (
                        <tr key={rowKey} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-gray-900 font-mono truncate text-xs">
                            {ticket.id.substring(0, 10)}...
                          </td>
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-gray-900 truncate text-xs">
                            {ticket.participantname}
                          </td>
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-gray-600 hidden sm:table-cell truncate text-xs">
                            {ticket.eventname}
                          </td>
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-gray-600 hidden md:table-cell text-xs">
                            {new Date(ticket.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                isUsed ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {isUsed ? t("ticket.used") : t("ticket.valid")}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-right">
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {!isUsed && (
                                <button
                                  onClick={() => revokeTicket(ticket.id)}
                                  className="px-2 py-1 text-xs rounded border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium whitespace-nowrap"
                                >
                                  {t("admin.revoke")}
                                </button>
                              )}
                              <button
                                onClick={() => moveToTrash(ticket.id)}
                                className="px-2 py-1 text-xs rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-medium whitespace-nowrap"
                              >
                                <Trash2 className="w-3 h-3 inline mr-1" />
                                {t("admin.delete")}
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