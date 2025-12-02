"use client"

import Link from "next/link"
import { QrCode, Ticket, BarChart3, Shield, Menu, X } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSelector } from "@/components/LanguageSelector"
import { useState } from "react"

export default function Home() {
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative">
      {/* Fond décoratif animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-gray-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg hover:scale-110 transition-transform duration-300">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight truncate">
                EventPass
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <LanguageSelector />
              <Link
                href="/create-ticket"
                className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all text-xs whitespace-nowrap shadow-lg hover:shadow-xl hover:scale-105 duration-300"
              >
                {t("home.createTicket")}
              </Link>
              <Link
                href="/login"
                className="px-4 py-2.5 rounded-xl border-2 border-gray-300 hover:border-indigo-600 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 font-semibold transition-all text-xs whitespace-nowrap hover:scale-105 duration-300"
              >
                {t("home.admin")}
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="flex sm:hidden items-center gap-2">
              <LanguageSelector />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-2 space-y-2 border-t border-gray-200 pt-4 animate-fade-in-scale">
              <Link
                href="/create-ticket"
                className="block px-4 py-3 text-center rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("home.createTicket")}
              </Link>
              <Link
                href="/login"
                className="block px-4 py-3 text-center rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("home.admin")}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 lg:py-24">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 md:order-1 animate-slide-up">
            <div className="grid grid-cols-2 gap-4">
              <div className="group p-5 sm:p-6 rounded-2xl border-2 border-gray-200/50 hover:border-indigo-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-luxury hover:shadow-luxury-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1.5 text-sm">{t("home.createTicket")}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{t("home.description")}</p>
              </div>
              <div className="group p-5 sm:p-6 rounded-2xl border-2 border-gray-200/50 hover:border-emerald-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-luxury hover:shadow-luxury-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1.5 text-sm">{t("ticket.used")}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{t("scan.oneEntry")}</p>
              </div>
              <div className="group p-5 sm:p-6 rounded-2xl border-2 border-gray-200/50 hover:border-blue-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-luxury hover:shadow-luxury-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1.5 text-sm">PDF {t("actions.download")}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{t("create.preview")}</p>
              </div>
              <div className="group p-5 sm:p-6 rounded-2xl border-2 border-gray-200/50 hover:border-amber-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-luxury hover:shadow-luxury-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1.5 text-sm">{t("admin.title")}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{t("scan.permanentlyInvalid")}</p>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 animate-slide-up">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-semibold mb-6 animate-shimmer">
              ✨ Premium Ticketing Solution
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
              <span className="block">{t("home.title")}</span>
              <span className="block text-gradient mt-2">Reimagined</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              {t("home.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/create-ticket"
                className="group relative px-8 py-4 rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold transition-all text-center text-sm shadow-luxury-lg hover:shadow-2xl hover:scale-105 duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <QrCode className="w-5 h-5" />
                  {t("home.createTicket")}
                </span>
              </Link>
              <Link
                href="/scan"
                className="px-8 py-4 rounded-2xl border-2 border-gray-300 hover:border-indigo-600 bg-white hover:bg-indigo-50 text-gray-900 hover:text-indigo-700 font-bold transition-all text-center text-sm hover:scale-105 duration-300 shadow-lg"
              >
                {t("home.scanTicket")}
              </Link>
            </div>
          </div>
        </div>
      </section>


    </main>
  )
}