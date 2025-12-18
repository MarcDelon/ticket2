"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getTicketById, Ticket } from "@/lib/ticketService";
import { ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface BilletAccesProps {
  ticket: Ticket;
  qrDataUrl: string | null;
}

function BilletAcces({ ticket, qrDataUrl }: BilletAccesProps) {
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
              flex-direction: row; /* Repasse en côte-à-côte */
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

export default function TicketPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        if (typeof id !== 'string') {
          throw new Error("ID de billet invalide");
        }
        
        const fetchedTicket = await getTicketById(id);
        setTicket(fetchedTicket);
        
        // Générer le QR code
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(id)}`;
        setQrDataUrl(qrCodeUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement du billet");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du billet...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Billet non trouvé</h2>
          <p className="text-gray-600 mb-6">Le billet que vous recherchez n'existe pas ou n'est plus disponible.</p>
          <Link href="/" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const shareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Billet pour ${ticket.eventname}`,
          text: `Voici votre billet pour l'événement ${ticket.eventname}`,
          url: `https://ticket2-phi.vercel.app/t/${ticket.id}`,
        });
      } catch (err) {
        console.log("Partage annulé ou non supporté");
      }
    } else {
      // Copier le lien dans le presse-papiers
      try {
        await navigator.clipboard.writeText(`https://ticket2-phi.vercel.app/t/${ticket.id}`);
        alert("Lien copié dans le presse-papiers !");
      } catch (err) {
        console.error("Erreur lors de la copie du lien :", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <BilletAcces ticket={ticket} qrDataUrl={qrDataUrl} />
        
        {/* Informations supplémentaires */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Ce billet est unique et ne peut être utilisé qu'une seule fois
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={shareTicket}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-amber-600 bg-white hover:bg-amber-50 text-gray-900 hover:text-amber-700 font-medium transition-all text-sm"
            >
              <Share2 className="w-4 h-4 inline mr-2" />
              Partager
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-all text-sm"
            >
              Imprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
