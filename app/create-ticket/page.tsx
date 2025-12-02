"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Share2, Check, Sparkles, Calendar, Clock, MapPin, User } from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";
// @ts-ignore
import * as QRCodeReact from "qrcode.react";
import QRCode from "qrcode";
import { useLanguage } from "@/contexts/LanguageContext";
import { createTicket, Ticket } from "@/lib/ticketService";
import { PremiumTicket } from "@/components/PremiumTicket";

// @ts-ignore
const QRCodeCanvas = QRCodeReact.QRCodeCanvas || QRCodeReact;

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

  // Effet pour générer le QR Code et convertir en data URL
  useEffect(() => {
    if (ticket && typeof window !== 'undefined') {
      // Dynamically import QRCode to avoid SSR issues
      import('qrcode').then((QRCodeModule) => {
        // Créer un canvas temporaire pour générer le QR code
        const canvas = document.createElement('canvas');
        
        // Générer le QR code
        QRCodeModule.toCanvas(canvas, ticket.qrcode, {
          width: 100,
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
      }).catch((error: Error) => {
        console.error('Erreur lors de l\'import de qrcode:', error);
        // Fallback: créer une image vide
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 100, 100);
          ctx.fillStyle = '#000000';
          ctx.font = '10px Arial';
          ctx.fillText('QR CODE', 20, 50);
          const dataUrl = canvas.toDataURL('image/png');
          setQrDataUrl(dataUrl);
        }
      });
    }
  }, [ticket]);

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
      setError(err instanceof Error ? err.message : "Erreur lors de la création du billet");
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 relative">
      {/* Fond décoratif animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {ticket ? (
            <button
              onClick={() => {
                setTicket(null);
                setFormData({ 
                  eventName: "", 
                  participantName: "", 
                  date: new Date().toISOString().split("T")[0],
                  time: "19:00",
                  address: ""
                });
              }}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link 
              href="/" 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-light text-gray-900 tracking-tight truncate">
              {ticket ? (language === 'fr' ? "Votre billet" : "Your ticket") : t("create.title")}
            </h1>
            <p className="text-xs text-gray-500 font-light mt-0.5 truncate">
              {ticket ? (language === 'fr' ? "Présentez ce billet à l'entrée" : "Present this ticket at the entrance") : t("create.subtitle")}
            </p>
          </div>
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
            <PremiumTicket ticket={ticket} qrDataUrl={qrDataUrl} />

            {/* Actions Premium */}
            <div className="mt-10 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={downloadPDF}
                className="group relative px-8 py-4 rounded-2xl text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 font-bold transition-all text-sm shadow-luxury-lg hover:shadow-2xl hover:scale-105 duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  {t("actions.download")}
                </span>
              </button>
              <button className="px-8 py-4 rounded-2xl border-2 border-gray-300 hover:border-amber-600 bg-white hover:bg-amber-50 text-gray-900 hover:text-amber-700 font-bold transition-all text-sm hover:scale-105 duration-300 shadow-lg flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" />
                {t("actions.share")}
              </button>
            </div>
            
            {/* Back Button */}
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setTicket(null);
                  setFormData({ 
                    eventName: "", 
                    participantName: "", 
                    date: new Date().toISOString().split("T")[0],
                    time: "19:00",
                    address: ""
                  });
                }}
                className="text-sm text-amber-600 hover:text-amber-700 font-bold transition-colors hover:underline"
              >
                ← {t("actions.generateAnother")}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}