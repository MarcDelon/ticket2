"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === "fr" ? "en" : "fr";
    setLanguage(newLanguage);
  };

  const selectLanguage = (lang: "fr" | "en") => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
        aria-label="Changer de langue"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{language === "fr" ? "FR" : "EN"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button
              onClick={() => selectLanguage("fr")}
              className={`block w-full text-left px-4 py-2 text-sm ${
                language === "fr" 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Français
            </button>
            <button
              onClick={() => selectLanguage("en")}
              className={`block w-full text-left px-4 py-2 text-sm ${
                language === "en" 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              English
            </button>
          </div>
        </div>
      )}
    </div>
  );
}