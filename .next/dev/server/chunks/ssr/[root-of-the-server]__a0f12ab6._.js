module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/contexts/LanguageContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "useLanguage",
    ()=>useLanguage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
// Créer le contexte
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
// Dictionnaires de traduction
const translations = {
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
        "thankYou": "Merci d'avance pour votre participation à cet événement !"
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
        "thankYou": "Thank you in advance for participating in this event!"
    }
};
function LanguageProvider({ children }) {
    const [language, setLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("fr");
    // Charger la langue préférée depuis le localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const savedLang = localStorage.getItem("preferredLanguage");
        if (savedLang && (savedLang === "fr" || savedLang === "en")) {
            setLanguage(savedLang);
        }
    }, []);
    // Sauvegarder la langue dans le localStorage
    const updateLanguage = (lang)=>{
        setLanguage(lang);
        localStorage.setItem("preferredLanguage", lang);
    };
    // Fonction de traduction
    const t = (key)=>{
        return translations[language][key] || key;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            language,
            setLanguage: updateLanguage,
            t
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/LanguageContext.tsx",
        lineNumber: 245,
        columnNumber: 5
    }, this);
}
function useLanguage() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$3_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
}),
"[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.0.3_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a0f12ab6._.js.map