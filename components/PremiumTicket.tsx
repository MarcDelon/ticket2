"use client"

import { Calendar, Clock, MapPin, Ticket, Star } from "lucide-react"
import { Ticket as TicketType } from "@/lib/ticketService"

interface PremiumTicketProps {
  ticket: TicketType
  qrDataUrl?: string | null
}

export function PremiumTicket({ ticket, qrDataUrl }: PremiumTicketProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto animate-fade-in-scale">
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
      
      {/* Billet principal */}
      <div className="relative bg-white rounded-3xl shadow-luxury-lg overflow-hidden border-2 border-gray-100">
        {/* Header avec dégradé premium */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 pattern-dots overflow-hidden">
          {/* Motifs décoratifs dorés */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-4 left-4 w-32 h-32 border-4 border-white/20 rounded-full"></div>
            <div className="absolute top-8 left-8 w-24 h-24 border-4 border-white/10 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-40 h-40 border-4 border-white/20 rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-28 h-28 border-4 border-white/10 rounded-full"></div>
          </div>

          {/* Étoiles décoratives */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <Star
                key={i}
                className="absolute text-white/20 animate-float"
                size={16 + Math.random() * 8}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Badge VIP */}
          <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <span className="text-white font-bold text-xs tracking-wider flex items-center gap-1">
              <Star className="w-4 h-4 fill-white" />
              PREMIUM
            </span>
          </div>

          {/* Contenu header */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8">
            <div className="mb-2">
              <Ticket className="w-8 h-8 text-white/80" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">
              {ticket.eventname}
            </h2>
            <p className="text-white/90 text-sm font-medium">Event Ticket</p>
          </div>

          {/* Effet de découpe en haut */}
          <div className="absolute bottom-0 left-0 right-0 h-8">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 20">
              <path d="M0,0 Q30,20 60,0 T120,0 T180,0 T240,0 T300,0 T360,0 T420,0 T480,0 T540,0 T600,0 T660,0 T720,0 T780,0 T840,0 T900,0 T960,0 T1020,0 T1080,0 T1140,0 T1200,0 L1200,20 L0,20 Z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Corps du billet */}
        <div className="p-4 sm:p-6 md:p-8 bg-white pattern-grid">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations */}
            <div className="space-y-4">
              {/* Participant */}
              <div className="group">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                  Participant
                </label>
                <p className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                  {ticket.participantname}
                </p>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 hover:border-amber-300 transition-all hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Date
                  </p>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {new Date(ticket.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Heure */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 hover:border-amber-300 transition-all hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Heure
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {ticket.time}
                  </p>
                </div>
              </div>

              {/* Adresse */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 hover:border-amber-300 transition-all hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Lieu
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {ticket.address}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {/* Cadre décoratif autour du QR */}
                <div className="absolute -inset-4 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl opacity-10 blur-xl"></div>
                
                {/* QR Code avec cadre doré */}
                <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 p-4 sm:p-6 rounded-3xl border-4 border-amber-200 shadow-luxury">
                  <div className="bg-white p-3 sm:p-4 rounded-2xl">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Ticket className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Coins décoratifs dorés */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-amber-500 rounded-tl-lg"></div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-amber-500 rounded-tr-lg"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-amber-500 rounded-bl-lg"></div>
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-amber-500 rounded-br-lg"></div>
                </div>
              </div>
              
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 text-center">
                Scan at entrance
              </p>
            </div>
          </div>

          {/* Footer avec ID */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Ticket ID
                </p>
                <p className="text-sm font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                  {ticket.id?.substring(0, 16)}...
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  ticket.status === 'valid' 
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' 
                    : 'bg-red-100 text-red-700 border-2 border-red-200'
                }`}>
                  {ticket.status === 'valid' ? '✓ VALID' : '✗ USED'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Perforation sur les côtés */}
        <div className="absolute left-0 top-48 sm:top-56 -translate-y-1/2 w-6 h-12 bg-gray-50 rounded-r-full border-r-2 border-gray-200"></div>
        <div className="absolute right-0 top-48 sm:top-56 -translate-y-1/2 w-6 h-12 bg-gray-50 rounded-l-full border-l-2 border-gray-200"></div>
      </div>

      {/* Ombre portée sophistiquée */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-500/5 to-amber-600/10 blur-2xl translate-y-4"></div>
    </div>
  )
}
