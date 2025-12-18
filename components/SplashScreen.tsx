"use client"

import { useEffect, useState } from "react"
import { Ticket } from "lucide-react"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 600)
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center animate-fade-out">
      {/* Particules flottantes - positions déterministes pour éviter hydration mismatch */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${(i * 17 + 23) % 100}%`,
              top: `${(i * 23 + 37) % 100}%`,
              animationDelay: `${(i * 0.3) % 2}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Logo central */}
      <div className="relative z-10 text-center">
        <div className="mb-8 animate-bounce-slow">
          <div className="relative inline-flex">
            {/* Cercles pulsants en arrière-plan */}
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
            
            {/* Logo */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/20">
              <Ticket className="w-12 h-12 md:w-16 md:h-16 text-white animate-scale" />
            </div>
          </div>
        </div>

        {/* Texte */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 animate-slide-up tracking-tight">
          EventPass
        </h1>
        <p className="text-white/80 text-lg md:text-xl font-light animate-slide-up-delay tracking-wide">
          Premium Event Ticketing
        </p>

        {/* Barre de chargement */}
        <div className="mt-12 w-64 md:w-80 mx-auto">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-loading-bar"></div>
          </div>
        </div>
      </div>

      {/* Effet de grain */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
    </div>
  )
}
