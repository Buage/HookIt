"use client"

import { useState, useEffect } from "react"
import { Info, Trash2, Send, Edit, Copy, Check } from "lucide-react"
import WebhookSender from "./WebhookSender"
import WebhookEditor from "./WebhookEditor"
import { useToast } from "./ToastContext"

interface WebhookInfoProps {
  webhookUrl: string
}

interface WebhookData {
  application_id: string | null
  avatar: string | null
  channel_id: string
  guild_id: string
  id: string
  name: string
  type: number
  token: string
  url: string
}

export default function WebhookInfo({ webhookUrl }: WebhookInfoProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [webhookData, setWebhookData] = useState<WebhookData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchWebhookInfo = async () => {
      try {
        const response = await fetch(webhookUrl)
        if (!response.ok) {
          if (response.status === 404) {
            showToast("Invalid webhook: 404")
          }
          throw new Error("Failed to fetch webhook info")
        }
        const data = await response.json()
        setWebhookData(data)
      } catch (err) {
        setError("Failed to fetch webhook info")
      }
    }

    fetchWebhookInfo()
  }, [webhookUrl, showToast])

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      showToast(`Copied ${fieldName} to clipboard`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      showToast("Failed to copy to clipboard")
    }
  }

  const deleteWebhook = async () => {
    try {
      const response = await fetch(webhookUrl, { method: "DELETE" })
      if (response.ok) {
        setWebhookData(null)
        showToast("Webhook deleted successfully")
        setError("Webhook deleted successfully")
      } else {
        throw new Error("Failed to delete webhook")
      }
    } catch (err) {
      showToast("Failed to delete webhook: 404")
    }
  }

  const tabs = [
    { id: "info", label: "Info", icon: Info },
    { id: "delete", label: "Delete", icon: Trash2 },
    { id: "spam", label: "Spam", icon: Send },
    { id: "edit", label: "Edit", icon: Edit },
  ]

  const CopyableField = ({ label, value, fieldName }: { label: string; value: string; fieldName: string }) => (
    <div className="flex items-center justify-between gap-2">
      <p className="flex-1 break-all">
        {label}: {value}
      </p>
      <button
        onClick={() => copyToClipboard(value, fieldName)}
        className="p-1 hover:bg-gray-800 rounded-md transition-colors flex-shrink-0"
      >
        {copiedField === fieldName ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )

  return (
    <div className="bg-[#0f0f10] rounded-md p-4 mb-4 border border-gray-700">
      <div className="flex space-x-2 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button px-3 py-1 rounded-md flex items-center transition-all duration-200 hover:scale-105 ${
                activeTab === tab.id ? "active bg-white text-black" : "bg-[#0f0f10] text-white border border-gray-700"
              }`}
            >
              <Icon className="w-4 h-4 mr-1" />
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="tab-content">
        {activeTab === "info" && (
          <div className="space-y-2 text-sm">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : webhookData ? (
              <>
                <CopyableField label="Name" value={webhookData.name} fieldName="name" />
                <p>Avatar: {webhookData.avatar ? "Yes" : "No"}</p>
                <CopyableField label="ID" value={webhookData.id} fieldName="id" />
                <CopyableField label="Token" value={webhookData.token} fieldName="token" />
                <CopyableField label="Channel ID" value={webhookData.channel_id} fieldName="channel_id" />
                <CopyableField label="Guild ID" value={webhookData.guild_id} fieldName="guild_id" />
              </>
            ) : (
              <p>Loading webhook information...</p>
            )}
          </div>
        )}
        {activeTab === "delete" && (
          <div className="space-y-4">
            <p>Are you sure you want to delete this webhook?</p>
            <button
              onClick={deleteWebhook}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 hover:scale-105"
            >
              Delete Webhook
            </button>
          </div>
        )}
        {activeTab === "spam" && <WebhookSender webhookUrl={webhookUrl} />}
        {activeTab === "edit" && <WebhookEditor webhookUrl={webhookUrl} />}
      </div>
    </div>
  )
}

