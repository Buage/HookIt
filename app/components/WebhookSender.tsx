"use client"

import { useState, useRef } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { useToast } from "./ToastContext"

interface WebhookSenderProps {
  webhookUrl: string
}

export default function WebhookSender({ webhookUrl }: WebhookSenderProps) {
  const [message, setMessage] = useState("")
  const [webhookName, setWebhookName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [delay, setDelay] = useState<number | "">(100)
  const [tts, setTts] = useState(false)
  const [status, setStatus] = useState("")
  const [isSpamming, setIsSpamming] = useState(false)
  const spamIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { showToast } = useToast()

  const calculateRate = () => {
    if (!delay || delay === 0) return "Infinite"
    const rate = Math.round(1000 / (typeof delay === "string" ? Number.parseInt(delay) : delay))
    return `~${rate} messages/second`
  }

  const sendWebhook = async () => {
    setIsSpamming(true)
    setStatus("Spamming...")

    const spamInterval = setInterval(async () => {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: message,
            username: webhookName || undefined,
            avatar_url: avatarUrl || undefined,
            tts: tts,
          }),
        })

        if (response.status === 404) {
          showToast("Invalid webhook: 404")
          stopSpamming()
          return
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After")
          const waitTime = retryAfter ? Math.round(Number.parseFloat(retryAfter)) : 5
          setStatus(`Rate limited. Waiting ${waitTime} seconds...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime * 1000))
          setStatus("Spamming...")
        }
      } catch (error) {
        showToast("Failed to send webhook")
        stopSpamming()
      }
    }, delay || 100)

    spamIntervalRef.current = spamInterval
  }

  const stopSpamming = () => {
    if (spamIntervalRef.current) {
      clearInterval(spamIntervalRef.current)
      setIsSpamming(false)
      setStatus("Spamming stopped")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
          Message to spam
        </label>
        <input
          id="message"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 bg-[#0f0f10] rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={webhookName}
            onChange={(e) => setWebhookName(e.target.value)}
            className="w-full px-3 py-2 bg-[#0f0f10] rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white text-white"
          />
        </div>
        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-300 mb-1">
            Avatar URL
          </label>
          <input
            id="avatar"
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full px-3 py-2 bg-[#0f0f10] rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white text-white"
          />
        </div>
      </div>
      <div>
        <label htmlFor="delay" className="block text-sm font-medium text-gray-300 mb-1">
          Delay (ms) - {calculateRate()}
        </label>
        <input
          id="delay"
          type="number"
          value={delay}
          onChange={(e) => {
            const value = e.target.value === "" ? "" : Math.max(0, Number.parseInt(e.target.value))
            setDelay(value)
          }}
          className="w-full px-3 py-2 bg-[#0f0f10] rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white text-white"
          min="0"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setTts(!tts)}
          className={`tts-button px-6 py-2 rounded-md transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
            tts ? "active bg-white text-black" : "bg-[#0f0f10] text-white border border-gray-700"
          }`}
        >
          {tts ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          TTS
        </button>
        <button
          onClick={isSpamming ? stopSpamming : sendWebhook}
          className={`px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 ${
            isSpamming ? "bg-white text-black" : "bg-[#0f0f10] text-white border border-gray-700 hover:bg-gray-800"
          }`}
        >
          {isSpamming ? "Stop" : "Start"}
        </button>
      </div>
      {status && <p className="text-center text-sm text-gray-300">{status}</p>}
    </div>
  )
}

