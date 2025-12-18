"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Scan, Camera, QrCode, Loader, CheckCircle, XCircle, AlertCircle, Delete } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTicketById, updateTicketStatus } from "@/lib/ticketService";
import { Ticket } from "@/lib/ticketService";

// Charger dynamiquement le scanner QR pour éviter les problèmes SSR
const QrScannerComponent = dynamic(() => import("@/components/QrScanner"), {
  ssr: false,
});

export default function ScanPage() {
  // État pour l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAuthForm, setShowAuthForm] = useState(true);
  const { t, language } = useLanguage();
  const [scanning, setScanning] = useState(true);
  
  // Références pour les éléments audio
  const successSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);
  const usedSoundRef = useRef<HTMLAudioElement>(null);
  
  // États pour le scanner
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    type: "success" | "error" | "used";
    message: string;
    ticket?: Ticket;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  // Vérifier l'authentification au chargement
  useEffect(() => {
    const authStatus = localStorage.getItem("scanAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      setShowAuthForm(false);
    }
  }, []);

  // Fonction pour gérer l'authentification
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authCode === "982125") {
      localStorage.setItem("scanAuth", "true");
      setIsAuthenticated(true);
      setShowAuthForm(false);
      setAuthError("");
    } else {
      setAuthError("Code d'accès incorrect");
    }
  };

  // Fonction pour se déconnecter
  const handleLogout = () => {
    localStorage.removeItem("scanAuth");
    setIsAuthenticated(false);
    setShowAuthForm(true);
  };

  // Fonction pour réinitialiser le scan
  const resetScan = () => {
    setResult(null);
    setScanning(true);
    setError(null);
  };

  // Fonction appelée lorsque le scanner trouve un QR code
  const handleScanResult = async (data: string) => {
    if (!scanning) return;
    
    setScanning(false);
    
    try {
      // Vérifier si les données scannées sont une URL valide
      let ticketId = '';
      
      try {
        const url = new URL(data);
        // Vérifier que l'URL est valide et contient un chemin
        if (url.origin && url.pathname && url.pathname.length > 1) {
          ticketId = url.pathname.split('/').pop() || '';
        } else {
          // Si l'URL n'a pas de chemin valide, utiliser les données directement
          ticketId = data.trim();
        }
      } catch (urlError) {
        // Si ce n'est pas une URL, essayons de traiter les données directement
        // Cela peut arriver si le QR code contient directement l'ID du ticket
        ticketId = data.trim();
      }
      
      if (!ticketId) {
        throw new Error("Invalid ticket data");
      }
      
      // Récupérer le ticket
      const ticket = await getTicketById(ticketId);
      
      if (!ticket) {
        // Jouer le son d'erreur
        if (errorSoundRef.current) {
          try {
            await errorSoundRef.current.play();
          } catch (err) {
            console.warn("Erreur lors de la lecture du son d'erreur:", err);
          }
        }
        setResult({
          type: "error",
          message: t("scan.ticketNotFound")
        });
        return;
      }
      
      // Vérifier si le ticket est déjà utilisé
      if (ticket.status === "used") {
        // Jouer le son de ticket utilisé
        if (usedSoundRef.current) {
          try {
            await usedSoundRef.current.play();
          } catch (err) {
            console.warn("Erreur lors de la lecture du son de ticket utilisé:", err);
          }
        }
        setResult({
          type: "used",
          message: t("scan.ticketAlreadyUsed"),
          ticket
        });
        return;
      }
      
      // Marquer le ticket comme utilisé
      await updateTicketStatus(ticketId, "used");
      
      // Mettre à jour le ticket local
      const updatedTicket = { ...ticket, status: "used" as const };
      
      // Jouer le son de succès
      if (successSoundRef.current) {
        try {
          await successSoundRef.current.play();
        } catch (err) {
          console.warn("Erreur lors de la lecture du son de succès:", err);
        }
      }
      setResult({
        type: "success",
        message: t("scan.accessGranted"),
        ticket: updatedTicket
      });
    } catch (err) {
      console.error("Scan error:", err);
      // Jouer le son d'erreur
      if (errorSoundRef.current) {
        try {
          await errorSoundRef.current.play();
        } catch (err) {
          console.warn("Erreur lors de la lecture du son d'erreur:", err);
        }
      }
      setResult({
        type: "error",
        message: t("scan.invalidQRCode")
      });
    }
  };

  // Fonction appelée en cas d'erreur du scanner
  const handleScanError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Afficher le formulaire d'authentification si l'utilisateur n'est pas authentifié
  if (showAuthForm && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center relative">
              <Link 
                href="/" 
                className="absolute left-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Scan className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-light text-white tracking-tight">Accès administrateur</h1>
              <p className="text-emerald-100 text-sm mt-1">Entrez le code d'accès pour scanner des billets</p>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <form onSubmit={handleAuth}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-4 text-center">
                    Code d'accès
                  </label>
                  
                  <div className="flex justify-center gap-3 mb-6">
                    <input
                      type="password"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-center text-lg font-bold"
                      placeholder="Entrez le code d'accès"
                      required
                    />
                  </div>
                  
                  {/* Clavier numérique */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                      <button
                        key={number}
                        type="button"
                        onClick={() => setAuthCode(prev => prev + number.toString())}
                        className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xl transition-colors flex items-center justify-center"
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAuthCode(prev => prev.slice(0, -1))}
                      className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors flex items-center justify-center"
                    >
                      <Delete className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthCode(prev => prev + "0")}
                      className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xl transition-colors flex items-center justify-center"
                    >
                      0
                    </button>
                  </div>
                </div>
                
                {authError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                    {authError}
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 duration-200"
                >
                  Accéder
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
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
            onClick={() => {
              // Déconnecter l'utilisateur lorsqu'il clique sur la flèche de retour
              localStorage.removeItem("scanAuth");
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg px-3 py-2 transition-all font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">{t("scan.back")}</span>
          </Link>
          <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-center flex-1 truncate">
            {t("scan.title")}
          </h1>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          )}
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
          {typeof window !== 'undefined' && QrScannerComponent && (
            <QrScannerComponent 
              onResult={handleScanResult}
              onError={handleScanError}
            />
          )}

          {/* Badge Scan en haut */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white font-bold text-xs flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="hidden xs:inline">SCANNING MODE</span>
            <span className="xs:hidden">SCAN</span>
          </div>

          {/* Overlay de scan premium */}
          {scanning && (
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
}           </div>
          </div>
        )}
      </div>
    </main>
  )
}           </div>
          </div>
        )}
      </div>
    </main>
  )
}