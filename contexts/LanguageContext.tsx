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
    
    // Page de création
    "create.title": "Créer un billet",
    "create.subtitle": "Générez un billet numérique pour votre événement",
    "create.ticketDetails": "Détails du billet",
    "create.ticketDetailsDesc": "Remplissez les informations pour générer un billet unique",
    "create.eventName": "Nom de l'événement",
    "create.eventPlaceholder": "Concert, conférence, mariage...",
    "create.participantName": "Nom du participant",
    "create.participantPlaceholder": "Nom complet du détenteur du billet",
    "create.eventDate": "Date",
    "create.eventTime": "Heure",
    "create.eventAddress": "Adresse",
    "create.addressPlaceholder": "Lieu de l'événement",
    "create.generateButton": "Générer le billet",
    "create.generating": "Génération en cours...",
    "create.preview": "Aperçu du billet",
    
    // Page de scan
    "scan.title": "Scanner un billet",
    "scan.back": "Retour",
    "scan.instructions": "Instructions",
    "scan.allowCamera": "Autorisez l'accès à la caméra lorsque demandé",
    "scan.pointCamera": "Pointez la caméra sur le code QR",
    "scan.holdSteady": "Maintenez stable pour le scan automatique",
    "scan.oneEntry": "Les billets valides donnent droit à une entrée unique",
    "scan.permanentlyInvalid": "Les billets utilisés deviennent définitivement invalides",
    "scan.invalid": "Billet invalide",
    "scan.alreadyUsed": "Billet déjà utilisé",
    "scan.welcome": "Bienvenue {name} !",
    "scan.validTicket": "✓ Billet Valide",
    "scan.invalidTicket": "✗ Invalide",
    "scan.usedTicket": "⚠ Déjà Utilisé",
    
    // Page d'administration
    "admin.title": "Administration des billets",
    "admin.back": "Retour",
    "admin.show": "Afficher stats",
    "admin.hide": "Masquer stats",
    "admin.trash": "Corbeille",
    "admin.backToTickets": "Retour aux billets",
    "admin.totalTickets": "Billets totaux",
    "admin.used": "Utilisés",
    "admin.valid": "Valides",
    "admin.all": "Tous",
    "admin.validFilter": "Valides",
    "admin.usedFilter": "Utilisés",
    "admin.noTickets": "Aucun billet trouvé",
    "admin.ticketId": "ID Billet",
    "admin.participant": "Participant",
    "admin.event": "Événement",
    "admin.date": "Date",
    "admin.status": "Statut",
    "admin.actions": "Actions",
    "admin.revoke": "Révoquer",
    "admin.delete": "Supprimer",
    "admin.restore": "Restaurer",
    "admin.deletePermanently": "Suppr. définitive",
    "admin.emptyTrash": "La corbeille est vide",
    "admin.noDeletedTickets": "Aucun billet supprimé",
    "admin.logout": "Déconnexion",
    
    // Page de login
    "login.title": "Accès administrateur",
    "login.subtitle": "Entrez votre code PIN pour accéder à l'administration",
    "login.enterPin": "Entrez votre code PIN à 4 chiffres",
    "login.pinHint": "Chaque case représente un chiffre",
    "login.access": "Accéder à l'administration",
    "login.incompletePin": "Veuillez entrer les 4 chiffres du code PIN",
    "login.invalidPin": "Code PIN incorrect",
    "login.success": "Authentification réussie",
    "login.redirecting": "Redirection vers l'administration...",
    "login.help": "Code PIN d'accès",
    "login.rights": "Tous droits réservés",
    
    // Page de billet
    "ticket.generated": "Billet généré !",
    "ticket.ready": "Votre billet est prêt à être utilisé",
    "ticket.valid": "Valide",
    "ticket.used": "Utilisé",
    
    // Actions générales
    "actions.download": "Télécharger PDF",
    "actions.share": "Partager",
    "actions.generateAnother": "Générer un autre billet",
    "actions.scanNext": "Scanner suivant",
    
    // Autres
    "thankYou": "Merci d'avance pour votre participation à cet événement !",
  },
  en: {
    // Home page
    "home.title": "Event Ticket Generator",
    "home.description": "Create and manage your digital event tickets",
    "home.createTicket": "Create Ticket",
    "home.scanTicket": "Scan Ticket",
    "home.admin": "Admin",
    
    // Create page
    "create.title": "Create Ticket",
    "create.subtitle": "Generate a digital ticket for your event",
    "create.ticketDetails": "Ticket Details",
    "create.ticketDetailsDesc": "Fill in the information to generate a unique ticket",
    "create.eventName": "Event Name",
    "create.eventPlaceholder": "Concert, conference, wedding...",
    "create.participantName": "Participant Name",
    "create.participantPlaceholder": "Full name of ticket holder",
    "create.eventDate": "Date",
    "create.eventTime": "Time",
    "create.eventAddress": "Address",
    "create.addressPlaceholder": "Event location",
    "create.generateButton": "Generate Ticket",
    "create.generating": "Generating...",
    "create.preview": "Ticket Preview",
    
    // Scan page
    "scan.title": "Scan Ticket",
    "scan.back": "Back",
    "scan.instructions": "Instructions",
    "scan.allowCamera": "Allow camera access when prompted",
    "scan.pointCamera": "Point camera at the QR code",
    "scan.holdSteady": "Hold steady for automatic scan",
    "scan.oneEntry": "Valid tickets grant one-time entry",
    "scan.permanentlyInvalid": "Used tickets become permanently invalid",
    "scan.invalid": "Invalid ticket",
    "scan.alreadyUsed": "Ticket already used",
    "scan.welcome": "Welcome {name}!",
    "scan.validTicket": "✓ Valid Ticket",
    "scan.invalidTicket": "✗ Invalid",
    "scan.usedTicket": "⚠ Already Used",
    
    // Admin page
    "admin.title": "Ticket Administration",
    "admin.back": "Back",
    "admin.show": "Show stats",
    "admin.hide": "Hide stats",
    "admin.trash": "Trash",
    "admin.backToTickets": "Back to tickets",
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
    "admin.restore": "Restore",
    "admin.deletePermanently": "Delete permanently",
    "admin.emptyTrash": "Trash is empty",
    "admin.noDeletedTickets": "No deleted tickets",
    "admin.logout": "Logout",
    
    // Login page
    "login.title": "Administrator Access",
    "login.subtitle": "Enter your PIN code to access administration",
    "login.enterPin": "Enter your 4-digit PIN code",
    "login.pinHint": "Each box represents one digit",
    "login.access": "Access Administration",
    "login.incompletePin": "Please enter all 4 digits of the PIN code",
    "login.invalidPin": "Incorrect PIN code",
    "login.success": "Authentication successful",
    "login.redirecting": "Redirecting to administration...",
    "login.help": "Access PIN code",
    "login.rights": "All rights reserved",
    
    // Ticket page
    "ticket.generated": "Ticket Generated!",
    "ticket.ready": "Your ticket is ready to use",
    "ticket.valid": "Valid",
    "ticket.used": "Used",
    
    // General actions
    "actions.download": "Download PDF",
    "actions.share": "Share",
    "actions.generateAnother": "Generate Another Ticket",
    "actions.scanNext": "Scan Next",
    
    // Other
    "thankYou": "Thank you in advance for participating in this event!",
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