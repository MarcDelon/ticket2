'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getTicketById } from '@/lib/ticketService';
import { Ticket } from '@/lib/ticketService';
import { Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Composant BilletAcces (copié depuis app/ticket/[id]/page.tsx)
function BilletAcces({ ticket, qrDataUrl }: { ticket: Ticket; qrDataUrl: string }) {
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
            max-width: 400px; /* Largeur maximale pour mobile */
            margin: 2rem auto; /* Centrage horizontal */
            padding: 1.5rem; /* Espacement interne */
            background: linear-gradient(145deg, var(--color-light), #ffffff);
            border-radius: 20px; /* Coins arrondis */
            box-shadow: 
              0 10px 30px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255,255,255,0.8);
            position: relative;
            overflow: hidden;
            border: 1px solid var(--color-accent);
          }

          /* Effet décoratif doré */
          .access-ticket::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--color-gold), #d4c0a1, var(--color-gold));
          }

          /* En-tête du billet */
          .ticket-header {
            text-align: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px dashed var(--color-gold);
          }

          /* Titre principal */
          .ticket-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--color-dark);
            margin: 0;
            letter-spacing: 1px;
          }

          /* Sous-titre */
          .ticket-subtitle {
            font-family: 'Montserrat', sans-serif;
            font-size: 1rem;
            color: var(--color-gold);
            font-weight: 700;
            margin: 0.5rem 0 0;
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          /* Corps du billet */
          .ticket-body {
            display: grid;
            grid-template-columns: 1fr; /* Une colonne sur mobile */
            gap: 1.2rem;
          }

          /* Section des informations */
          .info-section {
            background: rgba(197, 164, 126, 0.08);
            border-radius: 12px;
            padding: 1rem;
            border: 1px solid rgba(197, 164, 126, 0.2);
          }

          .info-label {
            font-family: 'Montserrat', sans-serif;
            font-size: 0.75rem;
            color: var(--color-gold);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.25rem;
          }

          .info-value {
            font-family: 'Montserrat', sans-serif;
            font-size: 1rem;
            color: var(--color-dark);
            font-weight: 700;
            margin: 0;
          }

          /* Section du QR Code */
          .qr-section {
            text-align: center;
            padding: 1rem;
          }

          .qr-title {
            font-family: 'Montserrat', sans-serif;
            font-size: 0.875rem;
            color: var(--color-gold);
            font-weight: 700;
            margin-bottom: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .qr-code-container {
            background: white;
            padding: 0.75rem;
            border-radius: 12px;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border: 1px solid var(--color-accent);
          }

          /* Pied de page */
          .ticket-footer {
            text-align: center;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 2px dashed var(--color-gold);
          }

          .ticket-id {
            font-family: 'Montserrat', sans-serif;
            font-size: 0.75rem;
            color: #666;
            font-weight: 400;
            margin: 0;
            letter-spacing: 1px;
          }

          /* Adaptation Desktop */
          @media (min-width: 768px) {
            .access-ticket {
              width: 90%; /* Un peu plus large sur desktop */
              max-width: 500px; /* Largeur maximale plus grande */
              padding: 2rem;
            }

            .ticket-title {
              font-size: 2.2rem;
            }

            .ticket-body {
              grid-template-columns: 1fr 1fr; /* Deux colonnes sur desktop */
            }

            .info-section {
              padding: 1.25rem;
            }

            .qr-section {
              grid-column: span 2; /* QR code sur toute la largeur */
            }
          }

          /* Adaptation très grands écrans */
          @media (min-width: 1200px) {
            .access-ticket {
              max-width: 550px;
              padding: 2.5rem;
            }
          }
        `
      }} />

      {/* En-tête du billet */}
      <div className="ticket-header">
        <h1 className="ticket-title">ACCÈS VIP</h1>
        <p className="ticket-subtitle">Événement exclusif</p>
      </div>

      {/* Corps du billet */}
      <div className="ticket-body">
        {/* Informations de l'événement */}
        <div className="info-section">
          <p className="info-label">Événement</p>
          <p className="info-value">{ticket.eventname}</p>
        </div>

        <div className="info-section">
          <p className="info-label">Participant</p>
          <p className="info-value">{ticket.participantname}</p>
        </div>

        <div className="info-section">
          <p className="info-label">Date</p>
          <p className="info-value">{ticket.date}</p>
        </div>

        <div className="info-section">
          <p className="info-label">Heure</p>
          <p className="info-value">{ticket.time}</p>
        </div>

        <div className="info-section">
          <p className="info-label">Lieu</p>
          <p className="info-value">{ticket.address}</p>
        </div>

        {/* QR Code */}
        <div className="qr-section">
          <p className="qr-title">Code d'accès unique</p>
          <div className="qr-code-container">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="QR Code du billet" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-xs">Chargement...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="ticket-footer">
        <p className="ticket-id">ID: {ticket.id}</p>
      </div>
    </div>
  );
}

export default function TicketPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const fetchedTicket = await getTicketById(params.id);
        if (!fetchedTicket) {
          notFound();
          return;
        }
        setTicket(fetchedTicket);
      } catch (err) {
        console.error('Erreur lors du chargement du billet:', err);
        setError('Impossible de charger le billet');
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params.id]);

  // Effet pour générer le QR Code et convertir en data URL
  useEffect(() => {
    if (ticket && typeof window !== 'undefined') {
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
      });
    }
  }, [ticket]);

  const shareTicket = async () => {
    if (ticket) {
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre billet...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Billet non trouvé</h1>
          <p className="text-gray-600 mb-6">Le billet que vous recherchez n'existe pas ou n'est plus valide.</p>
          <a 
            href="/" 
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-all"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

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