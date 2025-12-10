"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, Check, Delete } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [pin, setPin] = useState(["", "", "", ""])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // Focus automatique sur le premier champ
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    // Ne permettre que les chiffres
    if (!/^\d*$/.test(value)) return
    
    // Limiter à un seul chiffre
    const newValue = value.slice(0, 1)
    
    const newPin = [...pin]
    newPin[index] = newValue
    setPin(newPin)
    
    // Passer automatiquement au champ suivant
    if (newValue && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // Vérifier automatiquement si le PIN est complet
    if (newPin.every(digit => digit !== "")) {
      verifyPin(newPin);
    }
    
    // Effacer les erreurs
    setError("")
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Gérer la suppression vers l'arrière
    if (e.key === "Backspace" && !pin[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const verifyPin = (pinToVerify: string[]) => {
    // Vérifier le code PIN (par exemple: 2823)
    const enteredPin = pinToVerify.join("")
    if (enteredPin === "2823") {
      setSuccess(true)
      // Stocker l'état d'authentification
      localStorage.setItem("adminAuthenticated", "true")
      // Rediriger vers la page admin après un court délai
      setTimeout(() => {
        router.push("/admin")
      }, 1000)
    } else {
      setError(t("login.invalidPin"))
      // Vider les champs
      setPin(["", "", "", ""])
      // Focus sur le premier champ
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus()
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Vérifier que tous les champs sont remplis
    if (pin.some(digit => digit === "")) {
      setError(t("login.incompletePin"))
      return
    }
    
    verifyPin(pin);
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData("text").replace(/\D/g, '').slice(0, 4)
    
    if (paste.length === 4) {
      const newPin = paste.split('')
      setPin(newPin)
      
      // Vérifier automatiquement si le PIN est complet
      if (newPin.every(digit => digit !== "")) {
        verifyPin(newPin);
      }
    }
  }

  // Fonction pour gérer le clic sur les boutons du clavier
  const handleKeyPress = (key: string) => {
    // Trouver le premier champ vide
    const emptyIndex = pin.findIndex(digit => digit === "");
    
    if (key === "backspace") {
      // Gérer la suppression
      if (emptyIndex > 0) {
        // Si tous les champs sont remplis, vider le dernier
        if (emptyIndex === -1) {
          const newPin = [...pin];
          newPin[3] = "";
          setPin(newPin);
        } else {
          // Sinon, vider le champ précédent
          const newPin = [...pin];
          newPin[emptyIndex - 1] = "";
          setPin(newPin);
          inputRefs.current[emptyIndex - 1]?.focus();
        }
      } else if (emptyIndex === 0) {
        // Si le premier champ est vide, ne rien faire
        return;
      } else if (emptyIndex === -1) {
        // Si tous les champs sont remplis, vider le dernier
        const newPin = [...pin];
        newPin[3] = "";
        setPin(newPin);
        inputRefs.current[3]?.focus();
      }
    } else {
      // Gérer l'entrée d'un chiffre
      if (emptyIndex !== -1) {
        const newPin = [...pin];
        newPin[emptyIndex] = key;
        setPin(newPin);
        
        // Passer au champ suivant
        if (emptyIndex < 3) {
          inputRefs.current[emptyIndex + 1]?.focus();
        }
        
        // Vérifier automatiquement si le PIN est complet
        if (newPin.every(digit => digit !== "")) {
          verifyPin(newPin);
        }
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center relative">
            <Link 
              href="/" 
              className="absolute left-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-light text-white tracking-tight">{t("login.title")}</h1>
            <p className="text-blue-100 text-sm mt-1">{t("login.subtitle")}</p>
          </div>
          
          {/* Body */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">{t("login.success")}</h2>
                <p className="text-gray-600 text-sm">{t("login.redirecting")}</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-4 text-center">
                      {t("login.enterPin")}
                    </label>
                    
                    <div className="flex justify-center gap-3 mb-6">
                      {pin.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            if (el) inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-gray-50"
                          readOnly
                        />
                      ))}
                    </div>
                    
                    {/* Clavier numérique */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                        <button
                          key={number}
                          type="button"
                          onClick={() => handleKeyPress(number.toString())}
                          className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xl transition-colors flex items-center justify-center"
                        >
                          {number}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleKeyPress("0")}
                        className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xl transition-colors flex items-center justify-center"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeyPress("backspace")}
                        className="h-14 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-colors flex items-center justify-center"
                      >
                        <Delete className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <p className="text-center text-xs text-gray-500 mt-2">
                      {t("login.pinHint")}
                    </p>
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                      {error}
                    </div>
                  )}
                  
                  {/* Le bouton est caché car la vérification se fait automatiquement */}
                  <button type="submit" className="hidden" />
                </form>
              </>
            )}
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} EventPass - {t("login.rights")}
        </p>
      </div>
    </main>
  )
}