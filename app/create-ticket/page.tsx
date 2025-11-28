"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Share2, Check } from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";
// @ts-ignore
import * as QRCodeReact from "qrcode.react";
import QRCode from "qrcode";
import { useLanguage } from "@/contexts/LanguageContext";
import { createTicket, Ticket } from "@/lib/ticketService";

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

  // Fonction downloadPDF (Style Classique)
  const downloadPDF = () => {
    if (!ticket || !qrDataUrl) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [180, 80] 
    });

    // Dimensions du document (billet)
    const ticketWidth = 180;
    const ticketHeight = 80;
    const stubWidth = 40; // Largeur du talon (section QR Code)

    const paperColor = "#f9f6e5"; // Papier ancien (même couleur que le CSS)
    const stubColor = "#e6e3d2"; // Talon (légèrement plus foncé)
    const textColor = "#3d3b37"; // Texte marron foncé

    // 1. Fond du Billet
    doc.setFillColor(paperColor);
    doc.rect(0, 0, ticketWidth, ticketHeight, "F");

    // 2. Encadrement du billet (style classique)
    doc.setDrawColor(textColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(2, 2, ticketWidth - 4, ticketHeight - 4, 3, 3, "S");
    
    // 3. Dessiner la zone du talon (Stub)
    doc.setFillColor(stubColor);
    doc.rect(ticketWidth - stubWidth, 0, stubWidth, ticketHeight, "F");
    
    // 4. Ligne de Perforation (Déchirure) - Simulée avec des petits segments
    doc.setDrawColor(textColor);
    const dashLength = 1;
    const gapLength = 1;
    for (let y = 0; y < ticketHeight; y += dashLength + gapLength) {
      doc.line(ticketWidth - stubWidth, y, ticketWidth - stubWidth, y + dashLength);
    }

    // --- Contenu Principal (Partie Gauche) ---
    doc.setTextColor(textColor);
    doc.setFont("helvetica", "bold");
    
    // Nom de l'Événement
    doc.setFontSize(18);
    doc.text(ticket.eventname.toUpperCase(), 10, 15);
    
    // Statut du billet
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const statusText = ticket.status === 'valid' ? (language === 'fr' ? 'STATUT: VALIDE' : 'STATUS: VALID') : (language === 'fr' ? 'STATUT: UTILISÉ' : 'STATUS: USED');
    const statusColor = ticket.status === 'valid' ? [0, 128, 0] : [128, 0, 0]; // Vert ou rouge
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, ticketWidth - stubWidth - 10, 12, { align: "right" });
    
    // Réinitialiser la couleur du texte
    doc.setTextColor(textColor);
    
    // Ligne de Séparation
    doc.setDrawColor(textColor);
    doc.line(10, 17, ticketWidth - stubWidth - 10, 17);

    // Sous-titre
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const subtitleText = language === 'fr' ? "BILLET D'ENTRÉE - VEUILLEZ GARDER CE TALON" : "ENTRY TICKET - PLEASE KEEP THIS STUB";
    doc.text(subtitleText, 10, 22);

    // Détails
    doc.setFontSize(12);
    const detailsY = 35;
    
    // DATE
    doc.setFont("helvetica", "bold");
    const dateLabel = language === 'fr' ? "DATE:" : "DATE:";
    doc.text(dateLabel, 10, detailsY);
    doc.setFont("helvetica", "normal");
    
    // Formatage de la date
    const formattedDate = new Date(ticket.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).toUpperCase();
    
    doc.text(formattedDate, 10, detailsY + 5);

    // HEURE
    doc.setFont("helvetica", "bold");
    const timeLabel = language === 'fr' ? "HEURE:" : "TIME:";
    doc.text(timeLabel, 60, detailsY);
    doc.setFont("helvetica", "normal");
    doc.text(ticket.time, 60, detailsY + 5);

    // LIEU
    doc.setFont("helvetica", "bold");
    const addressLabel = language === 'fr' ? "LIEU:" : "VENUE:";
    doc.text(addressLabel, 110, detailsY);
    doc.setFont("helvetica", "normal");
    doc.text(ticket.address, 110, detailsY + 5);


    // Texte Légal / Bas
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const legalText = language === 'fr' ? "Présentez ce billet pour l'accès. Non transférable. Toute fraude annulera le billet." : "Present this ticket for entry. Non-transferable. Any fraud will invalidate the ticket.";
    doc.text(legalText, 10, ticketHeight - 10);
    
    
    // --- Contenu du Talon (Partie Droite) ---
    
    // Numéro de Billet (texte vertical)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const ticketNumberLabel = language === 'fr' ? "BILLET N°: " : "TICKET #: ";
    doc.text(ticketNumberLabel, ticketWidth - stubWidth + 5, 10);
    doc.setFontSize(14);
    doc.text(ticket.id, ticketWidth - stubWidth + 5, 15);

    // QR Code
    const qrSize = 35;
    const qrX = ticketWidth - stubWidth / 2 - qrSize / 2;
    const qrY = ticketHeight / 2 - qrSize / 2 + 5; 
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    
    // Texte QR
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const scanText = language === 'fr' ? "SCANNER LE CODE" : "SCAN CODE";
    doc.text(scanText, ticketWidth - stubWidth / 2, qrY + qrSize + 5, { align: "center" });

    // Sauvegarder le PDF
    doc.save(`billet-classique-${ticket.id}.pdf`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center gap-4">
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
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-light text-gray-900 tracking-tight">
              {ticket ? (language === 'fr' ? "Votre billet" : "Your ticket") : t("create.title")}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light mt-0.5">
              {ticket ? (language === 'fr' ? "Présentez ce billet à l'entrée" : "Present this ticket at the entrance") : t("create.subtitle")}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {!ticket ? (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Form Section */}
            <div>
              <form onSubmit={generateTicket} className="space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-1 tracking-tight">{t("create.ticketDetails")}</h2>
                  <p className="text-sm text-gray-500 font-light">{t("create.ticketDetailsDesc")}</p>
                </div>

                {error && (
                  <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">{t("create.eventName")}</label>
                    <input
                      type="text"
                      required
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      placeholder={t("create.eventPlaceholder")}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm backdrop-blur-sm"
                    />
                  </div>

                  {/* Participant Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">{t("create.participantName")}</label>
                    <input
                      type="text"
                      required
                      value={formData.participantName}
                      onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                      placeholder={t("create.participantPlaceholder")}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm backdrop-blur-sm"
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">{t("create.eventDate")}</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">{t("create.eventTime")}</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">{t("create.eventAddress")}</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder={t("create.addressPlaceholder")}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={isGenerating || !formData.participantName || !formData.eventName || !formData.address}
                  className="w-full py-3.5 sm:py-4 rounded-lg bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t("create.generating")}
                    </span>
                  ) : (
                    t("create.generateButton")
                  )}
                </button>
              </form>
            </div>

            {/* Preview Section - Empty State */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m-3.75 3v-3m0-6V3m0 0l3-3m-3 3l-3-3m3 3V12M9 12l3-3m-3 3l-3 3m3-3V18" />
                  </svg>
                </div>
                <p className="text-gray-500 font-light text-sm">{t("create.preview")}</p>
              </div>
            </div>
          </div>
        ) : (
          // Ticket Display
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-1 tracking-tight">{t("ticket.generated")}</h2>
              <p className="text-sm text-gray-500 font-light">{t("ticket.ready")}</p>
            </div>

            {/* Ticket Card - Aperçu Web (Style Classique) */}
            <div className="mx-auto grid grid-cols-4 classic-ticket-container" style={{ 
              width: '100%', 
              maxWidth: '600px', 
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', 
              backgroundColor: '#f9f6e5', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              position: 'relative' 
            }}>
              
              {/* Partie Principale (3/4 de la largeur) */}
              <div className="col-span-3 ticket-main text-gray-800 space-y-4" style={{ 
                border: '2px solid #3d3b37', 
                padding: '2rem', 
                position: 'relative', 
                backgroundColor: '#f9f6e5',
                borderTop: 'none',
                borderBottom: 'none',
                borderLeft: 'none'
              }}>
                <h3 className="text-4xl font-extrabold tracking-tight text-center uppercase border-b border-gray-400 pb-3 mb-4">
                  {ticket.eventname}
                </h3>
                
                {/* Affichage du statut du billet */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'valid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ticket.status === 'valid' ? t("ticket.valid") : t("ticket.used")}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs font-semibold mb-1 uppercase text-gray-500">{t("create.eventDate")}</p>
                    <p className="text-lg font-medium">
                      {new Date(ticket.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1 uppercase text-gray-500">{t("create.eventTime")}</p>
                    <p className="text-lg font-medium">{ticket.time}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1 uppercase text-gray-500">{t("create.eventAddress")}</p>
                    <p className="text-lg font-medium">{ticket.address}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-300/50">
                  <p className="text-sm italic text-center text-gray-600">
                    {t("thankYou")}
                  </p>
                </div>

                {/* Ligne de Perforation (Séparation) */}
                <div className="perforation-line" style={{
                  backgroundImage: 'linear-gradient(to bottom, #3d3b37 33%, transparent 33%, transparent 66%)',
                  backgroundSize: '2px 10px',
                  width: '2px',
                  height: '100%',
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  marginRight: '-1px'
                }}></div>
              </div>

              {/* Talon de Billet (1/4 de la largeur) */}
              <div className="col-span-1 ticket-stub flex flex-col items-center justify-center space-y-4" style={{
                border: '2px solid #3d3b37',
                padding: '1rem',
                backgroundColor: '#e6e3d2',
                borderTop: 'none',
                borderBottom: 'none',
                borderRight: 'none'
              }}>
                <p className="text-xs font-mono tracking-wider text-gray-600 transform -rotate-90 origin-center absolute top-1/2 -right-1">{language === 'fr' ? "BILLET N°" : "TICKET #"}</p>
                <div className="w-full text-center">
                  <p className="text-xs font-mono mb-2 text-gray-700">{ticket.id}</p>
                  <div className="w-20 h-20 mx-auto border border-gray-300 p-1 bg-white flex items-center justify-center">
                    <QRCodeCanvas 
                      value={ticket.qrcode} 
                      size={80}
                      bgColor="#f9f6e5"
                      fgColor="#3d3b37"
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs font-mono mt-2 text-gray-700">{language === 'fr' ? "SCAN ICI" : "SCAN HERE"}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 max-w-sm mx-auto grid grid-cols-1 gap-3">
              <button
                onClick={downloadPDF}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium transition-all text-sm shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                {t("actions.download")}
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium transition-all text-sm shadow-sm hover:shadow-md">
                <Share2 className="w-4 h-4" />
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
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                {t("actions.generateAnother")}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}