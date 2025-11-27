"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, Download, Share2, Check, QrCodeIcon as QRCodeIcon } from "lucide-react"
import Link from "next/link"
import QRCode from "qrcode.react"
import jsPDF from "jspdf"

interface Ticket {
  id: string
  eventName: string
  participantName: string
  date: string
  qrCode: string
  status: "valid" | "used"
  createdAt: Date
}

export default function CreateTicketPage() {
  const [formData, setFormData] = useState({
    eventName: "",
    participantName: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrRef, setQrRef] = useState<any>(null)

  const generateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    setTimeout(() => {
      const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      const newTicket: Ticket = {
        id: ticketId,
        eventName: formData.eventName,
        participantName: formData.participantName,
        date: formData.date,
        qrCode: ticketId,
        status: "valid",
        createdAt: new Date(),
      }

      setTicket(newTicket)
      setIsGenerating(false)

      const existingTickets = JSON.parse(localStorage.getItem("tickets") || "[]")
      existingTickets.push(newTicket)
      localStorage.setItem("tickets", JSON.stringify(existingTickets))
    }, 600)
  }

  const downloadPDF = () => {
    if (!ticket) return

    const doc = new jsPDF()

    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 210, 297, "F")

    doc.setTextColor(30, 64, 175)
    doc.setFontSize(28)
    doc.setFont("helvetica", "bold")
    doc.text("EVENT TICKET", 105, 25, { align: "center" })

    doc.setTextColor(80, 80, 80)
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`${ticket.eventName}`, 20, 50)
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(`Participant: ${ticket.participantName}`, 20, 62)
    doc.text(`Date: ${new Date(ticket.date).toLocaleDateString()}`, 20, 72)
    doc.text(`Ticket ID: ${ticket.id}`, 20, 82)

    const qrCanvas = document.getElementById("qr-code") as HTMLCanvasElement
    if (qrCanvas) {
      const qrImage = qrCanvas.toDataURL("image/png")
      doc.addImage(qrImage, "PNG", 65, 100, 80, 80)
    }

    doc.setFontSize(7)
    doc.setTextColor(160, 160, 160)
    doc.text("Valid for one-time entry only", 105, 285, { align: "center" })

    doc.save(`ticket-${ticket.id}.pdf`)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-light text-gray-900 tracking-tight">Generate Ticket</h1>
            <p className="text-xs sm:text-sm text-gray-400 font-light mt-0.5">Create and manage event tickets</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {!ticket ? (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Form Section */}
            <div>
              <form onSubmit={generateTicket} className="space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-1 tracking-tight">Ticket Details</h2>
                  <p className="text-sm text-gray-500 font-light">Enter the information for your event ticket</p>
                </div>

                <div className="space-y-6">
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Event Name</label>
                    <input
                      type="text"
                      required
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      placeholder="Your event name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>

                  {/* Participant Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Participant Name</label>
                    <input
                      type="text"
                      required
                      value={formData.participantName}
                      onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                      placeholder="Full name of the participant"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Event Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={isGenerating || !formData.participantName || !formData.eventName}
                  className="w-full py-3.5 sm:py-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base shadow-sm hover:shadow-md"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </span>
                  ) : (
                    "Generate Ticket"
                  )}
                </button>
              </form>
            </div>

            {/* Preview Section - Empty State */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <QRCodeIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-light text-sm">Your ticket preview will appear here</p>
              </div>
            </div>
          </div>
        ) : (
          // Ticket Display
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-1 tracking-tight">Ticket Generated</h2>
              <p className="text-sm text-gray-500 font-light">Your ticket has been successfully created</p>
            </div>

            {/* Ticket Card */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm mb-8">
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-8 text-white">
                <div className="text-sm font-light opacity-90 mb-2">{ticket.eventName}</div>
                <h3 className="text-xl sm:text-2xl font-light tracking-tight">{ticket.participantName}</h3>
              </div>

              {/* Ticket Content */}
              <div className="px-6 sm:px-8 py-8">
                {/* QR Code */}
                <div className="mb-8">
                  <div className="bg-gray-50 rounded-lg p-6 inline-flex mx-auto mb-4">
                    <div id="qr-code">
                      <QRCode value={ticket.qrCode} size={140} level="H" includeMargin={true} />
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 font-light">Scan this code at the entrance</p>
                </div>

                {/* Ticket Details */}
                <div className="space-y-4 mb-8 border-t border-b border-gray-100 py-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-light">Ticket ID</span>
                    <span className="text-sm font-mono text-gray-900 font-medium">{ticket.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-light">Event Date</span>
                    <span className="text-sm text-gray-900 font-medium">
                      {new Date(ticket.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-light">Status</span>
                    <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      Valid
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={downloadPDF}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium transition-all text-sm shadow-sm hover:shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium transition-all text-sm">
                    <Share2 className="w-4 h-4" />
                    Share Ticket
                  </button>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setTicket(null)
                  setFormData({ eventName: "", participantName: "", date: new Date().toISOString().split("T")[0] })
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Generate Another Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
