"use client"

import { useState } from "react"
import WebhookInfo from "./components/WebhookInfo"
import { ToastProvider } from "./components/ToastContext"
import { useToast } from "./components/ToastContext"

function Home() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [showOptions, setShowOptions] = useState(false)
  const [error, setError] = useState("")
  const { showToast } = useToast()

  const validateWebhook = async () => {
    if (!webhookUrl) return

    try {
      const response = await fetch(webhookUrl)
      if (response.ok) {
        setShowOptions(true)
        setError("")
      } else {
        if (response.status === 404) {
          showToast("Invalid webhook: 404")
        }
        setError("Invalid webhook URL")
      }
    } catch (err) {
      setError("Invalid webhook URL")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2">HookIt 🪝</h1>
      <p className="text-sm mb-8">Locally nuke a Discord webhook.</p>
      {!showOptions ? (
        <div className="w-full max-w-md space-y-4">
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="Webhook URL"
            className="w-full px-4 py-2 bg-[#0f0f10] rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={validateWebhook}
            className="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <WebhookInfo webhookUrl={webhookUrl} />
        </div>
      )}
      <footer className="mt-8 text-xs">Made with ❤️ by Buage</footer>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Home />
    </ToastProvider>
  )
}

