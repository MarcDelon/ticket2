"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface Ticket {
  id: string
  eventName: string
  participantName: string
  date: string
  qrCode: string
  status: "valid" | "used"
  createdAt: Date
}

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [scannedTickets, setScannedTickets] = useState<string[]>([])
  const [filter, setFilter] = useState<"all" | "valid" | "used">("all")
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    loadTickets()
    const interval = setInterval(loadTickets, 1000)
    return () => clearInterval(interval)
  }, [])

  const loadTickets = () => {
    const allTickets = JSON.parse(localStorage.getItem("tickets") || "[]")
    const scanned = JSON.parse(localStorage.getItem("scannedTickets") || "[]")
    setScannedTickets(scanned)
    setTickets(allTickets)
  }

  const filteredTickets = tickets.filter((ticket) => {
    const isUsed = scannedTickets.includes(ticket.id)
    if (filter === "all") return true
    if (filter === "valid") return !isUsed
    if (filter === "used") return isUsed
    return true
  })

  const deleteTicket = (id: string) => {
    const updated = tickets.filter((t) => t.id !== id)
    localStorage.setItem("tickets", JSON.stringify(updated))
    setTickets(updated)
  }

  const revokeTicket = (id: string) => {
    const scanned = JSON.parse(localStorage.getItem("scannedTickets") || "[]")
    if (!scanned.includes(id)) {
      scanned.push(id)
      localStorage.setItem("scannedTickets", JSON.stringify(scanned))
      setScannedTickets(scanned)
    }
  }

  const stats = {
    total: tickets.length,
    used: scannedTickets.length,
    valid: tickets.length - scannedTickets.length,
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
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-base sm:text-lg font-light text-gray-900 text-center flex-1 tracking-tight">
            Admin Dashboard
          </h1>
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors text-xs sm:text-sm font-medium flex-shrink-0"
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{showStats ? "Hide" : "Show"}</span>
            <span className="sm:hidden text-xs">{showStats ? "Hide" : "Show"}</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="p-5 sm:p-6 rounded border border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 mb-2 font-light">Total Tickets</div>
              <div className="text-2xl sm:text-3xl font-light text-gray-900">{stats.total}</div>
            </div>
            <div className="p-5 sm:p-6 rounded border border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 mb-2 font-light">Used</div>
              <div className="text-2xl sm:text-3xl font-light text-amber-600">{stats.used}</div>
            </div>
            <div className="p-5 sm:p-6 rounded border border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 mb-2 font-light">Valid</div>
              <div className="text-2xl sm:text-3xl font-light text-blue-600">{stats.valid}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "valid", "used"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 rounded font-medium transition-all text-xs sm:text-sm ${
                filter === f ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Tickets Table */}
        <div className="rounded border border-gray-200 overflow-hidden bg-white">
          {filteredTickets.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-gray-600 text-xs sm:text-sm font-light">No tickets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900">Ticket ID</th>
                    <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900">Participant</th>
                    <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900 hidden sm:table-cell">
                      Event
                    </th>
                    <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900 hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-left font-medium text-gray-900">Status</th>
                    <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-right font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => {
                    const isUsed = scannedTickets.includes(ticket.id)
                    return (
                      <tr key={ticket.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-gray-900 font-mono truncate text-xs">
                          {ticket.id.substring(0, 10)}...
                        </td>
                        <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-gray-900 truncate text-xs">
                          {ticket.participantName}
                        </td>
                        <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-gray-600 hidden sm:table-cell truncate text-xs">
                          {ticket.eventName}
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
                            {isUsed ? "Used" : "Valid"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2.5 sm:py-3 text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {!isUsed && (
                              <button
                                onClick={() => revokeTicket(ticket.id)}
                                className="px-2 py-1 text-xs rounded border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium whitespace-nowrap"
                              >
                                Revoke
                              </button>
                            )}
                            <button
                              onClick={() => deleteTicket(ticket.id)}
                              className="px-2 py-1 text-xs rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-medium whitespace-nowrap"
                            >
                              <Trash2 className="w-3 h-3 inline mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
