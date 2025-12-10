"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Loader, CheckCircle, XCircle, AlertCircle, Camera } from "lucide-react"
import Link from "next/link"
import jsQR from "jsqr"
import { useLanguage } from "@/contexts/LanguageContext"
import { getTicketById, updateTicketStatus, Ticket } from "@/lib/ticketService"

export default function ScanPage() {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error" | "used"
    message: string
    ticket?: Ticket
  } | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const successSoundRef = useRef<HTMLAudioElement>(null)
  const errorSoundRef = useRef<HTMLAudioElement>(null)
  const usedSoundRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    startCamera()
    
    // Nettoyer les ressources quand le composant est démonté
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (!isCameraReady || !scanning) return

    const interval = setInterval(() => {
      scanQRCode()
    }, 500)

    return () => clearInterval(interval)
  }, [scanning, isCameraReady])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true)
          setScanning(true)
        }
      }
    } catch (err) {
      setResult({ type: "error", message: t("scan.invalid") })
    }
  }

  const stopCamera = () => {
    try {
      // Arrêter tous les tracks de la caméra
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach(track => {
          track.stop()
        })
      }
      
      // Nettoyer la source vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      
      setIsCameraReady(false)
      setScanning(false)
    } catch (err) {
      console.error("Erreur lors de l'arrêt de la caméra:", err)
    }
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    ctx.drawImage(videoRef.current, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      processTicket(code.data)
      setScanning(false)
      stopCamera() // Arrêter la caméra après un scan réussi
    }
  }

  const processTicket = async (ticketId: string) => {
    try {
      // Récupérer le billet depuis la base de données
      const ticket = await getTicketById(ticketId)
      
      if (!ticket) {
        // Jouer le son d'erreur
        if (errorSoundRef.current) {
          errorSoundRef.current.currentTime = 0;
          errorSoundRef.current.play().catch(e => console.log("Erreur de lecture audio:", e));
        }
        setResult({ type: "error", message: t("scan.invalid") })
        return
      }

      // Vérifier si le billet a déjà été utilisé
      if (ticket.status === "used") {
        // Jouer le son de billet déjà utilisé
        if (usedSoundRef.current) {
          usedSoundRef.current.currentTime = 0;
          usedSoundRef.current.play().catch(e => console.log("Erreur de lecture audio:", e));
        }
        setResult({ 
          type: "used", 
          message: t("scan.alreadyUsed"),
          ticket
        })
        return
      }

      // Marquer le billet comme utilisé
      await updateTicketStatus(ticketId, "used")
      
      // Mettre à jour le ticket avec le nouveau statut
      const updatedTicket = { ...ticket, status: "used" as const }
      
      // Jouer le son de succès
      if (successSoundRef.current) {
        successSoundRef.current.currentTime = 0;
        successSoundRef.current.play().catch(e => console.log("Erreur de lecture audio:", e));
      }
      
      setResult({
        type: "success",
        message: t("scan.welcome").replace("{name}", ticket.participantname),
        ticket: updatedTicket,
      })
    } catch (err) {
      // Jouer le son d'erreur
      if (errorSoundRef.current) {
        errorSoundRef.current.currentTime = 0;
        errorSoundRef.current.play().catch(e => console.log("Erreur de lecture audio:", e));
      }
      setError(err instanceof Error ? err.message : "Erreur lors du traitement du billet")
      setResult({ type: "error", message: t("scan.invalid") })
    }
  }

  const resetScan = () => {
    setResult(null)
    setError(null)
    startCamera() // Redémarrer la caméra
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative">
      {/* Fond décoratif animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg px-3 py-2 transition-all font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">{t("scan.back")}</span>
          </Link>
          <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-center flex-1 truncate">
            {t("scan.title")}
          </h1>
          <div className="w-10 flex-shrink-0"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Audio elements for sound effects */}
        <audio ref={successSoundRef} preload="auto">
          <source src="/audio/success.mp3" type="audio/mpeg" />
        </audio>
        <audio ref={errorSoundRef} preload="auto">
          <source src="/audio/error.mp3" type="audio/mpeg" />
        </audio>
        <audio ref={usedSoundRef} preload="auto">
          <source src="/audio/used.mp3" type="audio/mpeg" />
        </audio>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs mb-3">
            {error}
          </div>
        )}

        <div className="relative rounded-3xl overflow-hidden border-4 border-emerald-500 shadow-luxury-lg bg-black mb-6 w-full animate-fade-in-scale"
          style={{ aspectRatio: "4 / 3" }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Badge Scan en haut */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white font-bold text-xs flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="hidden xs:inline">SCANNING MODE</span>
            <span className="xs:hidden">SCAN</span>
          </div>

          {/* Overlay de scan premium */}
          {isCameraReady && scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64">
                {/* Bordure principale animée */}
                <div className="absolute inset-0 border-4 border-emerald-400 rounded-3xl animate-pulse shadow-lg shadow-emerald-500/50"></div>
                
                {/* Coins du scanner - Style Premium */}
                <div className="absolute -top-2 -left-2 w-10 h-10 sm:w-12 sm:h-12 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl"></div>
                <div className="absolute -top-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl"></div>
                <div className="absolute -bottom-2 -left-2 w-10 h-10 sm:w-12 sm:h-12 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl"></div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl"></div>
                
                {/* Ligne de scan animée */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"></div>
                
                {/* Texte instructif */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white text-sm font-semibold whitespace-nowrap bg-black/50 px-3 py-2 rounded-full text-center max-w-[200px]">
                  <span className="hidden xs:inline">Positionnez le QR Code ici</span>
                  <span className="xs:hidden">Placez le QR Code</span>
                </div>
              </div>
            </div>
          )}

          {!isCameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900/80 to-teal-900/80 backdrop-blur-sm text-white p-4">
              <Loader className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
              <p className="text-base font-semibold text-center mb-2">{t("scan.allowCamera")}</p>
              <p className="text-xs text-emerald-200 text-center">Starting camera...</p>
            </div>
          )}
        </div>

        {/* Result - Version Premium */}
        {result && (
          <div className={`rounded-3xl p-6 sm:p-8 mb-6 shadow-luxury-lg transform transition-all duration-300 animate-fade-in-scale ${
            result.type === "success" 
              ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white" 
              : result.type === "error" 
                ? "bg-gradient-to-br from-red-500 via-red-600 to-rose-600 text-white" 
                : "bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white"
          }`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {result.type === "success" ? (
                  <CheckCircle className="w-10 h-10 animate-scale" />
                ) : result.type === "error" ? (
                  <XCircle className="w-10 h-10" />
                ) : (
                  <AlertCircle className="w-10 h-10" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-base font-bold mb-1">
                  {result.type === "success" 
                    ? "✓ " + t("scan.validTicket")
                    : result.type === "error" 
                      ? "✗ " + t("scan.invalidTicket")
                      : "⚠ " + t("scan.usedTicket")}
                </h3>
                
                <p className="text-sm mb-3 font-medium">
                  {result.message}
                </p>
                
                {result.ticket && (
                  <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-semibold opacity-80">{t("admin.participant")}</p>
                        <p className="font-bold truncate">{result.ticket.participantname}</p>
                      </div>
                      <div>
                        <p className="font-semibold opacity-80">{t("admin.event")}</p>
                        <p className="font-bold truncate">{result.ticket.eventname}</p>
                      </div>
                      <div>
                        <p className="font-semibold opacity-80">{t("admin.date")}</p>
                        <p className="font-bold">
                          {new Date(result.ticket.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold opacity-80">{t("create.eventTime")}</p>
                        <p className="font-bold">{result.ticket.time}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-white/30">
                      <p className="font-semibold opacity-80 text-[10px]">{t("admin.ticketId")}</p>
                      <p className="font-mono text-[10px] break-all">{result.ticket.id}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={resetScan}
              className="w-full mt-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold transition-all duration-200 backdrop-blur-sm border border-white/30 text-sm"
            >
              {t("actions.scanNext")}
            </button>
          </div>
        )}

        {/* Instructions */}
        {!result && (
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">{t("scan.instructions")}</h3>
            </div>
            
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <span className="text-xs font-light">{t("scan.allowCamera")}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <span className="text-xs font-light">{t("scan.pointCamera")}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <span className="text-xs font-light">{t("scan.holdSteady")}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <span className="text-xs font-light">{t("scan.oneEntry")}</span>
              </li>
            </ul>
            
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-800 text-xs font-light">
                <AlertCircle className="w-3.5 h-3.5 inline mr-1.5" />
                {t("scan.permanentlyInvalid")}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}