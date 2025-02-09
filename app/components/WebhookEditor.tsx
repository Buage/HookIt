"use client"

import { useState, useRef } from "react"
import { useToast } from "./ToastContext"

interface WebhookEditorProps {
  webhookUrl: string
}

export default function WebhookEditor({ webhookUrl }: WebhookEditorProps) {
  const [name, setName] = useState("")
  const [status, setStatus] = useState("")
  const [fileName, setFileName] = useState("Choose File")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const handleSave = async () => {
    try {
      // Update webhook name
      if (name) {
        const response = await fetch(webhookUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })

        if (!response.ok) {
          if (response.status === 404) {
            showToast("Invalid webhook: 404")
          }
          throw new Error("Failed to update webhook name")
        }
      }

      // Update avatar
      if (fileInputRef.current?.files?.length) {
        const file = fileInputRef.current.files[0]
        const reader = new FileReader()

        reader.onload = async () => {
          try {
            // Send OPTIONS request first
            await fetch(webhookUrl, {
              method: "OPTIONS",
            })

            // Then send the PATCH request with the avatar
            const base64Data = reader.result?.toString().split(",")[1]
            const response = await fetch(webhookUrl, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                avatar: base64Data,
              }),
            })

            if (!response.ok) {
              if (response.status === 404) {
                showToast("Invalid webhook: 404")
              }
              throw new Error("Failed to update webhook avatar")
            }
          } catch (error) {
            showToast("Failed to update webhook avatar")
            return
          }
        }

        reader.readAsDataURL(file)
      }

      setStatus("Webhook updated successfully")
      showToast("Webhook updated successfully")
    } catch (error) {
      setStatus("Failed to update webhook")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : "Choose File")
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-[#0f0f10] rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white text-white"
        />
      </div>
      <div>
        <label htmlFor="avatar" className="block text-sm font-medium text-gray-300 mb-1">
          Avatar
        </label>
        <div className="file-input-wrapper">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-3 py-2 bg-[#0f0f10] text-white rounded-md border border-gray-700 hover:bg-gray-800 transition-colors text-left"
          >
            {fileName}
          </button>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className="w-full px-4 py-2 bg-[#0f0f10] text-white rounded-md border border-gray-700 hover:bg-gray-800 transition-all duration-200 hover:scale-105"
      >
        Save
      </button>
      {status && <p className="text-center text-sm text-gray-300">{status}</p>}
    </div>
  )
}

