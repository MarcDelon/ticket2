"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Share2, Check, Sparkles, Calendar, Clock, MapPin, User, Delete } from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { useLanguage } from "@/contexts/LanguageContext";
import { createTicket, Ticket } from "@/lib/ticketService";
import { PremiumTicket } from "@/components/PremiumTicket";

export default function CreateTicketPage() {
  const { t, language } = useLanguage();
  const qrCodeCanvasRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [formData, setFormData] = useState({
    eventName: "",
    participantName: "",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    address: "",
  });
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État pour l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAuthForm, setShowAuthForm] = useState(true);
  
  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem("createTicketAuth");
      
      if (authStatus === "true") {
        setIsAuthenticated(true);
        setShowAuthForm(false);
      } else {
        setIsAuthenticated(false);
        setShowAuthForm(true);
      }
    };
    
    // Vérifier immédiatement
    checkAuthStatus();
    
    // Et aussi quand le storage change
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "createTicketAuth") {
        checkAuthStatus();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  // Fonction pour gérer l'authentification
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authCode === "982125") {
      localStorage.setItem("createTicketAuth", "true");
      setIsAuthenticated(true);
      setShowAuthForm(false);
      setAuthError("");
    } else {
      setAuthError("Code d'accès incorrect");
    }
  };

  // Fonction pour se déconnecter
  const handleLogout = () => {
    localStorage.removeItem("createTicketAuth");
    setIsAuthenticated(false);
    setShowAuthForm(true);
  };

  // Effet pour générer le QR Code et convertir en data URL
  useEffect(() => {
    if (ticket && typeof window !== 'undefined') {
      // Importer QRCode de manière dynamique
      import('qrcode').then((QRCode) => {
        // Créer un canvas temporaire pour générer le QR code
        const canvas = document.createElement('canvas');
        
        // Générer le QR code
        QRCode.default.toCanvas(canvas, ticket.qrcode, {
          width: 200,
          margin: 1,
          color: {
            dark: '#3d3b37',
            light: '#f9f6e5'
          }
        }, (error: Error | null | undefined) => {
          if (error) {
            console.error('Erreur lors de la génération du QR Code:', error);
          } else {
            // Convertir en data URL
            const dataUrl = canvas.toDataURL('image/png');
            setQrDataUrl(dataUrl);
          }
        });
      }).catch((error) => {
        console.error('Erreur lors du chargement de la bibliothèque QRCode:', error);
      });
    }
  }, [ticket]);
  
  // Effet pour vérifier l'authentification - doit toujours être présent
  useEffect(() => {
    const authStatus = localStorage.getItem("createTicketAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      setShowAuthForm(false);
    }
  }, []);

  const generateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const newTicket = await createTicket({
        eventname: formData.eventName,
        participantname: formData.participantName,
        date: formData.date,
        time: formData.time,
        address: formData.address,
        qrcode: "" // Nous allons générer cet ID après la création
      });

      // Mettre à jour le qrcode avec l'ID du billet
      newTicket.qrcode = newTicket.id;
      
      setTicket(newTicket);
      setIsGenerating(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du billet";
      // Vérifier si l'erreur est liée à la configuration de Supabase
      if (errorMessage.includes('Supabase is not configured')) {
        setError("La base de données n'est pas configurée. Veuillez configurer les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      } else {
        setError(errorMessage);
      }
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!ticket || !qrDataUrl) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [280, 140],
    });

    const width = 280;
    const height = 140;

    /* -----------------------------------------------------
       FOND PREMIUM
    ----------------------------------------------------- */
    doc.setFillColor(8, 8, 12); // Noir absolu ultra-luxe
    doc.rect(0, 0, width, height, "F");

    // Effet dégradé subtil haut → bas
    for (let i = 0; i < height; i++) {
      const shade = 10 + i * 0.18;
      doc.setDrawColor(shade, shade, shade);
      doc.line(0, i, width, i);
    }

    /* -----------------------------------------------------
       ENCADREMENT OR BRILLANT
    ----------------------------------------------------- */
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(1.4);
    doc.roundedRect(5, 5, width - 10, height - 10, 4, 4, "S");

    doc.setDrawColor(255, 185, 0);
    doc.setLineWidth(0.5);
    doc.roundedRect(9, 9, width - 18, height - 18, 3, 3, "S");

    /* -----------------------------------------------------
       BANDEAU TITRE OR / DÉGRADÉ PREMIUM
    ----------------------------------------------------- */
    const headerH = 32;
    for (let y = 0; y < headerH; y++) {
      const r = 255;
      const g = 200 - y * 0.9;
      const b = 50 - y * 0.3;
      doc.setFillColor(r, g, b);
      doc.rect(0, y, width, 1, "F");
    }

    /* -----------------------------------------------------
       LOGO VIP
    ----------------------------------------------------- */
    doc.setFillColor(8, 8, 12);
    doc.circle(25, 16, 10, "F");

    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(2);
    doc.circle(25, 16, 10, "S");

    doc.setTextColor(255, 215, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("VIP", 25, 19, { align: "center" });

    /* -----------------------------------------------------
       TITRE ÉVÉNEMENT
    ----------------------------------------------------- */
    // Ombre pour le texte
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "bold");
    doc.setFontSize(30);
    doc.text(ticket.eventname.toUpperCase(), width / 2 + 1, 21, { align: "center" });
    
    // Texte principal en blanc
    doc.setTextColor(255, 255, 255);
    doc.setFont("times", "bold");
    doc.setFontSize(30);
    doc.text(ticket.eventname.toUpperCase(), width / 2, 20, { align: "center" });

    // Ligne or décorative
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(0.8);
    doc.line(50, 28, width - 50, 28);

    /* -----------------------------------------------------
       CADRE PRINCIPAL
    ----------------------------------------------------- */
    doc.setFillColor(15, 15, 22);
    doc.roundedRect(20, 40, width - 40, height - 60, 5, 5, "F");

    doc.setDrawColor(255, 200, 60);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, 40, width - 40, height - 60, 5, 5, "S");

    /* -----------------------------------------------------
       NOM DE L'ÉVÉNEMENT (dans le cadre)
    ----------------------------------------------------- */
    doc.setTextColor(255, 215, 0);
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text("— " + ticket.eventname.toUpperCase() + " —", width / 2, 52, { align: "center" });

    /* -----------------------------------------------------
       NOM DU PARTICIPANT
    ----------------------------------------------------- */
    doc.setTextColor(255, 255, 255);
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text(ticket.participantname.toUpperCase(), width / 2, 64, { align: "center" });

    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(0.4);
    doc.line(width / 2 - 60, 68, width / 2 + 60, 68);

    /* -----------------------------------------------------
       DISPOSITION EN 2 LIGNES : QR à gauche, infos à droite
    ----------------------------------------------------- */
    
    // QR CODE À GAUCHE
    const qrSize = 32;
    const qx = 50;
    const qy = 78;

    // Cadre or simple pour le QR
    doc.setFillColor(255, 215, 0);
    doc.roundedRect(qx - 3, qy - 3, qrSize + 6, qrSize + 6, 2, 2, "F");

    doc.setFillColor(10, 10, 15);
    doc.roundedRect(qx - 1, qy - 1, qrSize + 2, qrSize + 2, 1, 1, "F");

    // QR final
    doc.addImage(qrDataUrl, "PNG", qx, qy, qrSize, qrSize);

    // INFORMATIONS À DROITE DU QR (déplacées plus à droite)
    const infoX = 130;  // Position fixe plus à droite
    const infoY = 82;

    // DATE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 200, 40);
    doc.text(language === 'fr' ? "DATE:" : "DATE:", infoX, infoY);
    
    doc.setFont("times", "normal");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    const formatted = new Date(ticket.date).toLocaleDateString(
      language === "fr" ? "fr-FR" : "en-US",
      { day: "2-digit", month: "short", year: "numeric" }
    ).toUpperCase();
    doc.text(formatted, infoX + 35, infoY);

    // HEURE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 200, 40);
    doc.text(language === 'fr' ? "HEURE:" : "TIME:", infoX, infoY + 14);
    
    doc.setFont("times", "normal");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text(ticket.time, infoX + 35, infoY + 14);

    // LIEU
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 200, 40);
    doc.text(language === 'fr' ? "LIEU:" : "VENUE:", infoX, infoY + 28);
    
    doc.setFont("times", "normal");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    const venueText = ticket.address.length > 35 ? ticket.address.substring(0, 35) + "..." : ticket.address;
    doc.text(venueText, infoX + 35, infoY + 28);

    /* -----------------------------------------------------
       BAS DU BILLET
    ----------------------------------------------------- */
    const BY = height - 10;

    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(0.5);
    doc.line(40, BY - 8, width - 40, BY - 8);

    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.setFont("helvetica", "normal");
    doc.text(`BILLET #${ticket.id.substring(0, 10)}`, 40, BY - 2);

    doc.setTextColor(255, 215, 0);
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.text("EventPass Premium", width / 2, BY - 2, { align: "center" });

    /* ----------------------------------------------------- */

    doc.save(`billet-premium-${ticket.id}.pdf`);
  };

  // Afficher le formulaire d'authentification si l'utilisateur n'est pas authentifié
  if (showAuthForm && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-6 text-center relative">
              <Link 
                href="/" 
                className="absolute left-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-light text-white tracking-tight">Accès administrateur</h1>
              <p className="text-amber-100 text-sm mt-1">Entrez le code d'accès pour créer des billets</p>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-center text-lg font-bold"
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
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 duration-200"
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 relative">
      {/* Afficher le formulaire de création de billet si l'utilisateur est authentifié */}
      {isAuthenticated && !showAuthForm && (
        <>
          {/* Fond décoratif animé */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
          </div>

          {/* Header */}
          <header className="relative border-b border-gray-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
              <Link
                href="/"
                onClick={() => {
                  // Déconnecter l'utilisateur lorsqu'il clique sur la flèche de retour
                  localStorage.removeItem("createTicketAuth");
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-3 py-2 transition-all font-medium text-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">{t("create.back")}</span>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-light text-gray-900 tracking-tight truncate">
                  {ticket ? (language === 'fr' ? "Votre billet" : "Your ticket") : t("create.title")}
                </h1>
                <p className="text-xs text-gray-500 font-light mt-0.5 truncate">
                  {ticket ? (language === 'fr' ? "Présentez ce billet à l'entrée" : "Present this ticket at the entrance") : t("create.subtitle")}
                </p>
              </div>
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

          <div className="max-w-6xl mx-auto px-4 py-6">
            {!ticket ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Form Section */}
                <div>
                  <form onSubmit={generateTicket} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-light text-gray-900 mb-1 tracking-tight">{t("create.ticketDetails")}</h2>
                      <p className="text-xs text-gray-500 font-light">{t("create.ticketDetailsDesc")}</p>
                    </div>

                    {error && (
                      <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                        {error}
                      </div>
                    )}

                    <div className="space-y-5">
                      {/* Event Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-2">{t("create.eventName")}</label>
                        <input
                          type="text"
                          required
                          value={formData.eventName}
                          onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                          placeholder={t("create.eventPlaceholder")}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm backdrop-blur-sm"
                        />
                      </div>

                      {/* Participant Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-2">{t("create.participantName")}</label>
                        <input
                          type="text"
                          required
                          value={formData.participantName}
                          onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                          placeholder={t("create.participantPlaceholder")}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm backdrop-blur-sm"
                        />
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-2">{t("create.eventDate")}</label>
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white/80 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm backdrop-blur-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-2">{t("create.eventTime")}</label>
                          <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white/80 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm backdrop-blur-sm"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-2">{t("create.eventAddress")}</label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder={t("create.addressPlaceholder")}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button
                      type="submit"
                      disabled={isGenerating || !formData.participantName || !formData.eventName || !formData.address}
                      className="w-full py-3 rounded-lg bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg hover:shadow-xl"
                    >
                      {isGenerating ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span className="text-sm">{t("create.generating")}</span>
                        </span>
                      ) : (
                        <span className="text-sm">{t("create.generateButton")}</span>
                      )}
                    </button>
                  </form>
                </div>

                {/* Preview Section - Empty State */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-indigo-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m-3.75 3v-3m0-6V3m0 0l3-3m-3 3l-3-3m3 3V12M9 12l3-3m-3 3l-3 3m3-3V18" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-light text-xs">{t("create.preview")}</p>
                  </div>
                </div>
              </div>
            ) : (
              // Ticket Display
              <div className="relative">
                <div className="mb-8 text-center animate-fade-in-scale">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-luxury">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">{t("ticket.generated")}</h2>
                  <p className="text-sm text-gray-600">{t("ticket.ready")}</p>
                </div>

                {/* Nouveau Composant Premium Ticket */}
                <BilletAcces ticket={ticket} qrDataUrl={qrDataUrl} />

                {/* Actions Premium */}
                <div className="mt-10 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="px-8 py-4 rounded-2xl border-2 border-gray-300 bg-white text-gray-900 font-bold text-sm shadow-lg text-center">
                    <p className="font-bold text-gray-900 mb-1">Lien de votre billet</p>
                    <p className="text-xs text-gray-600 mb-2">Partagez ce lien avec le participant</p>
                    <div className="bg-gray-100 p-2 rounded text-[10px] font-mono break-all">
                      {typeof window !== 'undefined' && `https://ticket2-qi4z.vercel.app/t/${ticket.id}`}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Ce lien est unique et sécurisé</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(`https://ticket2-qi4z.vercel.app/t/${ticket.id}`);
                        alert("Lien copié dans le presse-papiers !");
                      }
                    }}
                    className="px-8 py-4 rounded-2xl border-2 border-gray-300 hover:border-amber-600 bg-white hover:bg-amber-50 text-gray-900 hover:text-amber-700 font-bold transition-all text-sm hover:scale-105 duration-300 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Copier le lien
                  </button>
                </div>

                {/* Actions supplémentaires */}
                <div className="mt-6 max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={downloadPDF}
                    className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-indigo-600 bg-white hover:bg-indigo-50 text-gray-900 hover:text-indigo-700 font-medium transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t("actions.download")}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-6 py-3 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-medium transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24-.03.48-.062.72-.096m-.72.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.911-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.911-.247M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM9 6.375a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    {t("actions.print")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

interface BilletAccesProps {
  ticket: Ticket;
  qrDataUrl: string | null;
}

export function BilletAcces({ ticket, qrDataUrl }: BilletAccesProps) {
  return (
    <div className="access-ticket w-full max-w-2xl mx-auto my-8">
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Importation de polices */
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;700&display=swap');

          /* Définition des couleurs chics */
          :root {
            --color-dark: #1a1a1a;
            --color-gold: #c5a47e;
            --color-light: #f5f5f5;
            --color-accent: #e6e6e6; 
          }

          /* Conteneur principal du billet (Optimisation Mobile par défaut) */
          .access-ticket {
            display: flex;
            flex-direction: column; /* Empilement vertical par défaut (Mobile First) */
            width: 95%; /* Prend presque toute la largeur du téléphone */
            max-width: 400px; /* Taille maximale pour simuler un écran mobile */
            background-color: var(--color-accent);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            overflow: hidden; 
            color: var(--color-dark);
            position: relative;
            font-family: 'Montserrat', sans-serif;
          }

          /* ------------------- SECTION INFOS ------------------- */
          .info-section {
            padding: 30px 20px;
            text-align: center; /* Centrer le texte sur mobile pour plus de clarté */
            background-color: #fff; 
          }

          .ticket-header {
            font-size: 0.9em;
            color: var(--color-gold);
            letter-spacing: 4px; /* Plus d'espacement */
            margin: 0 0 10px 0;
          }

          .event-title {
            font-family: 'Playfair Display', serif;
            font-size: 2em;
            margin-bottom: 25px;
            font-weight: 700;
          }

          .ticket-details {
            display: flex;
            flex-direction: column; /* Empile les détails */
            gap: 15px;
            margin-bottom: 25px;
          }

          .detail-item {
            min-width: 100%;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 1px dashed #eee;
          }

          .label {
            font-size: 0.8em;
            display: block;
            color: #888;
            margin-bottom: 5px;
          }

          .value {
            font-size: 1.2em;
            margin: 0;
            font-weight: 700;
          }

          .instructions {
            border-top: none;
            padding-top: 0;
            font-size: 0.8em;
            font-style: italic;
            color: #888;
            margin: 0;
          }

          /* ------------------- LIGNE DE SÉPARATION (Perforation) ------------------- */
          .perforation-line {
            height: 15px; /* Devient horizontal */
            width: 100%;
            position: relative;
            background-color: #fff; 
            border-top: 2px dashed #ccc;
            z-index: 10;
          }

          /* Effet de perforation (demi-cercles) */
          .perforation-line::before,
          .perforation-line::after {
            content: '';
            position: absolute;
            height: 30px;
            width: 30px;
            background-color: var(--color-dark); /* Fait correspondre la couleur au body/fond */
            border-radius: 50%;
            left: 10%; /* Décalage pour le look */
            z-index: 20;
            top: -15px;
          }

          .perforation-line::after {
            left: auto;
            right: 10%;
          }


          /* ------------------- SECTION DU CODE QR (Mise en avant) ------------------- */
          .scan-section {
            order: -1; /* Place la section de scan en haut sur mobile */
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            background-color: var(--color-dark); /* Fond sombre pour le contraste maximal */
            color: var(--color-light);
          }

          .qr-container {
            padding: 10px;
            background-color: white;
            border-radius: 5px;
            margin-bottom: 15px;
            border: 4px solid var(--color-gold);
            box-shadow: 0 0 20px rgba(197, 164, 126, 0.6); /* Ombre plus visible */
          }

          .qr-code-img {
            width: 200px; /* TAILLE DU QR CODE AUGMENTÉE POUR UN SCAN FACILE SUR MOBILE */
            height: 200px;
            display: block;
          }

          .ticket-number {
            font-size: 1.2em;
            font-weight: 700;
            color: var(--color-gold);
            letter-spacing: 2px;
            margin: 10px 0 5px;
          }

          .section-label {
            font-size: 0.8em;
            text-transform: uppercase;
            color: #888;
            margin: 0;
          }

          /* ------------------- MEDIA QUERY : Version Ordinateur (Optionnel) ------------------- */
          @media (min-width: 700px) {
            .access-ticket {
              flex-direction: row; /* Repasse en côte-à-côté */
              max-width: 800px; /* Reprend la largeur horizontale */
              width: 90%;
            }

            .info-section {
              flex-grow: 1;
              text-align: left; /* Réaligne le texte à gauche */
              padding: 30px 40px;
            }
            
            .ticket-details {
              flex-direction: row; /* Repasse en ligne */
              flex-wrap: wrap;
              text-align: left;
            }

            .detail-item {
              min-width: 45%; 
              text-align: left;
              border-bottom: none;
            }

            .scan-section {
              order: initial; /* Retour à l'ordre normal (à droite) */
              width: 250px; /* Largeur fixe à droite */
              min-height: 400px;
              justify-content: space-around; /* Mieux réparti */
              padding: 40px 20px;
            }

            .qr-code-img {
              width: 150px; /* Réduit un peu la taille sur desktop */
              height: 150px;
            }

            /* Ligne de perforation verticale */
            .perforation-line {
              width: 15px; 
              height: auto;
              border-left: 2px dashed #ccc;
              border-top: none; 
            }

            .perforation-line::before,
            .perforation-line::after {
              left: -17px;
              top: -15px;
              transform: none;
            }

            .perforation-line::after {
              top: auto;
              bottom: -15px;
              left: -17px;
              right: auto;
            }
          }
        `
      }} />
      
      <div className="info-section">
        <h2 className="ticket-header">BILLET D&apos;ACCÈS</h2>
        <h1 className="event-title">{ticket.eventname}</h1>
        
        <div className="ticket-details">
          <div className="detail-item">
            <span className="label">INVITÉ(E)</span>
            <p className="value">{ticket.participantname}</p>
          </div>
          <div className="detail-item">
            <span className="label">DATE & HEURE</span>
            <p className="value">
              {new Date(ticket.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }).toUpperCase()} - {ticket.time}
            </p>
          </div>
          <div className="detail-item">
            <span className="label">LIEU</span>
            <p className="value">{ticket.address}</p>
          </div>
        </div>
        
        <p className="instructions">
          Présentez ce billet (papier ou mobile) à l&apos;entrée.
        </p>
      </div>

      <div className="perforation-line"></div>

      <div className="scan-section">
        <div className="qr-container">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="Code QR d'accès" 
              className="qr-code-img"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500">QR Code</span>
            </div>
          )}
        </div>
        
        <p className="ticket-number">N° Billet : {ticket.id.substring(0, 16)}...</p>
        <p className="section-label">Scan à l&apos;entrée</p>
      </div>
    </div>
  );
}
