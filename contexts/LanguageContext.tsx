"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Définir les types pour nos traductions
interface Translations {
  [key: string]: string;
}

// Définir les langues supportées
type Language = "fr" | "en";

// Structure de notre contexte
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Créer le contexte
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Dictionnaires de traduction
const translations: Record<Language, Translations> = {
  fr: {
    // Page principale
    "home.title": "Générateur de Billets d'Événement",
    "home.description": "Créez et gérez vos billets d'événement numériques",
    "home.createTicket": "Créer un billet",
    "home.scanTicket": "Scanner un billet",
    "home.admin": "Administration",
    
    // Page de création de billet
    "create.back": "Retour",
    "create.title": "Générateur de Billet Classique",
    "create.subtitle": "Créez des billets au style rétro avec QR Code",
    "create.ticketDetails": "Détails de l'événement",
    "create.ticketDetailsDesc": "Ces informations seront affichées sur le billet",
    "create.eventName": "Nom de l'événement",
    "create.eventPlaceholder": "Concert de Jazz, Salon du Livre...",
    "create.participantName": "Nom du participant / Numéro de Billet",
    "create.participantPlaceholder": "Numéro unique ou nom du détenteur",
    "create.eventDate": "Date de l'événement",
    "create.eventTime": "Heure",
    "create.eventAddress": "Lieu / Adresse",
    "create.addressPlaceholder": "Nom de la salle, Ville",
    "create.generateButton": "Générer le billet",
    "create.generating": "Génération en cours...",
    "create.preview": "L'aperçu de votre billet apparaîtra ici",
    
    // Page de scan
    "scan.back": "Retour",
    "scan.title": "Scanner un QR Code",
    "scan.instructions": "Instructions",
    "scan.allowCamera": "• Autorisez l'accès à la caméra lorsque demandé",
    "scan.pointCamera": "• Dirigez la caméra vers le code QR",
    "scan.holdSteady": "• Maintenez ferme pour le scan automatique",
    "scan.oneEntry": "• Les billets valides donnent droit à une entrée",
    "scan.permanentlyInvalid": "• Les billets utilisés sont définitivement invalides",
    
    // Page d'administration
    "admin.back": "Retour",
    "admin.title": "Tableau de bord administrateur",
    "admin.hide": "Masquer",
    "admin.show": "Afficher",
    "admin.totalTickets": "Billets totaux",
    "admin.used": "Utilisés",
    "admin.valid": "Valides",
    "admin.all": "Tous",
    "admin.validFilter": "Valides",
    "admin.usedFilter": "Utilisés",
    "admin.noTickets": "Aucun billet trouvé",
    "admin.ticketId": "ID du billet",
    "admin.participant": "Participant",
    "admin.event": "Événement",
    "admin.date": "Date",
    "admin.status": "Statut",
    "admin.actions": "Actions",
    "admin.revoke": "Révoquer",
    "admin.delete": "Supprimer",
    
    // Messages de résultat du scan
    "scan.validTicket": "✓ Billet valide - Entrée autorisée",
    "scan.invalidTicket": "✗ Billet invalide",
    "scan.usedTicket": "⚠ Déjà utilisé - Entrée refusée",
    "scan.welcome": "Bienvenue {name} ! Billet marqué comme utilisé.",
    "scan.alreadyUsed": "Billet déjà utilisé - Entrée refusée",
    "scan.invalid": "Billet invalide",
    
    // États des billets
    "ticket.valid": "Valide",
    "ticket.used": "Utilisé",
    
    // Actions
    "actions.download": "Télécharger le billet PDF",
    "actions.share": "Partager",
    "actions.generateAnother": "Générer un autre billet",
    "actions.scanNext": "Scanner le suivant",
    
    // Messages divers
    "preview.appearsHere": "L'aperçu de votre billet apparaîtra ici",
    "ticket.generated": "Billet généré",
    "ticket.ready": "Votre billet est prêt à être téléchargé",
    "thankYou": "Merci de présenter ce billet à l'entrée. Billet non remboursable.",
  },
  en: {
    // Home page
    "home.title": "Event Ticket Generator",
    "home.description": "Create and manage your digital event tickets",
    "home.createTicket": "Create Ticket",
    "home.scanTicket": "Scan Ticket",
    "home.admin": "Admin",
    
    // Create ticket page
    "create.back": "Back",
    "create.title": "Classic Ticket Generator",
    "create.subtitle": "Create retro-style tickets with QR Code",
    "create.ticketDetails": "Event Details",
    "create.ticketDetailsDesc": "These information will be displayed on the ticket",
    "create.eventName": "Event Name",
    "create.eventPlaceholder": "Jazz Concert, Book Fair...",
    "create.participantName": "Participant Name / Ticket Number",
    "create.participantPlaceholder": "Unique number or holder name",
    "create.eventDate": "Event Date",
    "create.eventTime": "Time",
    "create.eventAddress": "Venue / Address",
    "create.addressPlaceholder": "Venue name, City",
    "create.generateButton": "Generate Ticket",
    "create.generating": "Generating...",
    "create.preview": "Your ticket preview will appear here",
    
    // Scan page
    "scan.back": "Back",
    "scan.title": "Scan QR Code",
    "scan.instructions": "Instructions",
    "scan.allowCamera": "• Allow camera access when prompted",
    "scan.pointCamera": "• Point camera at the QR code",
    "scan.holdSteady": "• Hold steady for automatic scan",
    "scan.oneEntry": "• Valid tickets grant one-time entry",
    "scan.permanentlyInvalid": "• Used tickets are permanently invalid",
    
    // Admin page
    "admin.back": "Back",
    "admin.title": "Admin Dashboard",
    "admin.hide": "Hide",
    "admin.show": "Show",
    "admin.totalTickets": "Total Tickets",
    "admin.used": "Used",
    "admin.valid": "Valid",
    "admin.all": "All",
    "admin.validFilter": "Valid",
    "admin.usedFilter": "Used",
    "admin.noTickets": "No tickets found",
    "admin.ticketId": "Ticket ID",
    "admin.participant": "Participant",
    "admin.event": "Event",
    "admin.date": "Date",
    "admin.status": "Status",
    "admin.actions": "Actions",
    "admin.revoke": "Revoke",
    "admin.delete": "Delete",
    
    // Scan result messages
    "scan.validTicket": "✓ Valid Ticket - Entry Granted",
    "scan.invalidTicket": "✗ Invalid Ticket",
    "scan.usedTicket": "⚠ Already Used - Entry Denied",
    "scan.welcome": "Welcome {name}! Ticket marked as used.",
    "scan.alreadyUsed": "Ticket already used - Entry denied",
    "scan.invalid": "Invalid ticket",
    
    // Ticket statuses
    "ticket.valid": "Valid",
    "ticket.used": "Used",
    
    // Actions
    "actions.download": "Download Ticket PDF",
    "actions.share": "Share",
    "actions.generateAnother": "Generate Another Ticket",
    "actions.scanNext": "Scan Next",
    
    // Various messages
    "preview.appearsHere": "Your ticket preview will appear here",
    "ticket.generated": "Ticket Generated",
    "ticket.ready": "Your ticket is ready to be downloaded",
    "thankYou": "Please present this ticket at the entrance. Non-refundable ticket.",
  },
};

// Provider de traduction
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");
  
  // Charger la langue préférée depuis le localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") as Language | null;
    if (savedLang && (savedLang === "fr" || savedLang === "en")) {
      setLanguage(savedLang);
    }
  }, []);
  
  // Sauvegarder la langue dans le localStorage
  const updateLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
  };
  
  // Fonction de traduction
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte de traduction
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}