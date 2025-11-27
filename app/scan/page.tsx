"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Loader } from "lucide-react"
import Link from "next/link"
import jsQR from "jsqr"

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error" | "used"
    message: string
    ticketId?: string
  } | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)

  useEffect(() => {
    startCamera()
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
      setResult({ type: "error", message: "Camera access denied" })
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
    }
  }

  const processTicket = (ticketId: string) => {
    const tickets = JSON.parse(localStorage.getItem("tickets") || "[]")
    const scannedTickets = JSON.parse(localStorage.getItem("scannedTickets") || "[]")

    const ticket = tickets.find((t: any) => t.id === ticketId)

    if (!ticket) {
      setResult({ type: "error", message: "Invalid ticket" })
      return
    }

    if (scannedTickets.includes(ticketId)) {
      setResult({ type: "used", message: "Ticket already used" })
      return
    }

    scannedTickets.push(ticketId)
    localStorage.setItem("scannedTickets", JSON.stringify(scannedTickets))

    setResult({
      type: "success",
      message: `Welcome ${ticket.participantName}!`,
      ticketId,
    })
  }

  const resetScan = () => {
    setResult(null)
    setScanning(true)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 font-light text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-base sm:text-lg font-light text-gray-900 text-center flex-1 truncate tracking-tight">
            Scan QR Code
          </h1>
          <div className="w-10 flex-shrink-0"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div
          className="relative rounded overflow-hidden border-2 border-blue-600 bg-black mb-6 w-full"
          style={{ aspectRatio: "16 / 9" }}
        >
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}

          {scanning && isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 sm:w-48 sm:h-48 border-2 border-blue-400 rounded animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div
            className={`p-5 sm:p-6 rounded border-2 mb-6 ${
              result.type === "success"
                ? "bg-blue-50 border-blue-600"
                : result.type === "error"
                  ? "bg-red-50 border-red-600"
                  : "bg-amber-50 border-amber-600"
            }`}
          >
            <h3
              className={`text-sm sm:text-base font-medium mb-2 ${
                result.type === "success"
                  ? "text-blue-900"
                  : result.type === "error"
                    ? "text-red-900"
                    : "text-amber-900"
              }`}
            >
              {result.type === "success" ? "✓ Valid Ticket" : result.type === "error" ? "✗ Invalid" : "⚠ Already Used"}
            </h3>
            <p className="text-gray-900 mb-3 text-xs sm:text-sm font-light">{result.message}</p>
            {result.ticketId && <p className="text-xs text-gray-600 font-mono break-all mb-4">{result.ticketId}</p>}
            <button
              onClick={resetScan}
              className="w-full px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-xs sm:text-sm"
            >
              Scan Next
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="p-5 sm:p-6 rounded border border-gray-200 bg-gray-50">
          <h3 className="text-gray-900 font-medium mb-3 text-xs sm:text-sm">Instructions</h3>
          <ul className="space-y-2 text-gray-700 text-xs font-light">
            <li>• Allow camera access when prompted</li>
            <li>• Point camera at the QR code</li>
            <li>• Hold steady for automatic scan</li>
            <li>• Valid tickets grant one-time entry</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
