"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { QrCode, Ticket, BarChart3, Shield } from "lucide-react"

interface Event {
  id: string
  name: string
  date: string
  location: string
  description: string
  ticketsGenerated: number
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const existingEvents = localStorage.getItem("events")
    if (existingEvents) {
      setEvents(JSON.parse(existingEvents))
    }
    setIsLoading(false)
  }, [])

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-xl font-light text-gray-900 tracking-tight truncate">EventPass</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              href="/create-ticket"
              className="px-3 sm:px-6 py-2 sm:py-2.5 rounded text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors text-xs sm:text-base whitespace-nowrap"
            >
              Generate
            </Link>
            <Link
              href="/admin"
              className="px-3 sm:px-6 py-2 sm:py-2.5 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors text-xs sm:text-base whitespace-nowrap"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 sm:p-6 rounded border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50">
                <QrCode className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 mb-3" />
                <h3 className="text-gray-900 font-medium mb-1 text-xs sm:text-sm">Unique QR Codes</h3>
                <p className="text-gray-600 text-xs font-light">Non-reproducible codes for maximum security</p>
              </div>
              <div className="p-4 sm:p-6 rounded border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50">
                <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 mb-3" />
                <h3 className="text-gray-900 font-medium mb-1 text-xs sm:text-sm">One-Time Use</h3>
                <p className="text-gray-600 text-xs font-light">Each ticket validates only once</p>
              </div>
              <div className="p-4 sm:p-6 rounded border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50">
                <Ticket className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 mb-3" />
                <h3 className="text-gray-900 font-medium mb-1 text-xs sm:text-sm">PDF Export</h3>
                <p className="text-gray-600 text-xs font-light">Download and share instantly</p>
              </div>
              <div className="p-4 sm:p-6 rounded border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50">
                <BarChart3 className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 mb-3" />
                <h3 className="text-gray-900 font-medium mb-1 text-xs sm:text-sm">Real-Time Stats</h3>
                <p className="text-gray-600 text-xs font-light">Monitor usage and attendance</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-light text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
              Secure Event Tickets
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 font-light leading-relaxed">
              Generate unique QR code tickets with enterprise-grade security. Validate entries in real-time and manage
              your events with elegance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/create-ticket"
                className="px-6 py-3 sm:py-4 rounded text-white bg-blue-600 hover:bg-blue-700 font-medium transition-all text-center text-sm sm:text-base"
              >
                Create Ticket
              </Link>
              <Link
                href="/scan"
                className="px-6 py-3 sm:py-4 rounded border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium transition-colors text-center text-sm sm:text-base"
              >
                Scan QR Code
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20 border-t border-gray-200">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-6 sm:mb-8 lg:mb-12 tracking-tight">
          Upcoming Events
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-r-transparent"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="p-6 sm:p-8 lg:p-12 rounded border border-gray-200 bg-gray-50 text-center">
            <Ticket className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-light text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-gray-600 text-xs sm:text-sm font-light mb-4 sm:mb-6">
              Create your first ticket to get started
            </p>
            <Link
              href="/create-ticket"
              className="inline-block px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-sm"
            >
              Generate Ticket
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="group p-5 sm:p-6 rounded border border-gray-200 hover:border-gray-300 transition-all bg-white"
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {event.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-light">{event.date}</p>
                  </div>
                  <Ticket className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
                <p className="text-gray-600 text-xs sm:text-sm font-light mb-3 line-clamp-2">{event.description}</p>
                <p className="text-xs text-gray-500 mb-4 font-light">📍 {event.location}</p>
                <Link
                  href={`/create-ticket?event=${event.id}`}
                  className="inline-block w-full text-center py-2 sm:py-2.5 rounded border border-blue-600 text-blue-600 font-medium hover:bg-blue-600 hover:text-white transition-all text-xs sm:text-sm"
                >
                  Generate Ticket
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
