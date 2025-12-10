"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { SplashScreen } from "@/components/SplashScreen"
import { useState, useEffect } from "react"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [showSplash, setShowSplash] = useState(true)
  const [hasShownSplash, setHasShownSplash] = useState(false)

  useEffect(() => {
    // Vérifier si le splash a déjà été montré dans cette session
    const splashShown = sessionStorage.getItem("splashShown")
    if (splashShown) {
      setShowSplash(false)
      setHasShownSplash(true)
    }
  }, [])

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShown", "true")
    setShowSplash(false)
    setHasShownSplash(true)
  }

  return (
    <html lang="en">
      <head>
        <title>EventPass - Premium Event Ticketing</title>
        <meta name="description" content="Generate unique QR code tickets with premium design. Secure, elegant, and effortless event management." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${_geist.className} font-sans antialiased bg-gradient-to-br from-gray-50 via-white to-blue-50 text-foreground`}>
        {showSplash && !hasShownSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <LanguageProvider>
          <div className={hasShownSplash ? "animate-fade-in-scale" : ""}>
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}